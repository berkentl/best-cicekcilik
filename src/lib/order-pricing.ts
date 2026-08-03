import { createServerClient } from "@/lib/supabase-server";
import { getPaymentSettings } from "@/lib/paymentSettings";
import { getSiteSettings } from "@/lib/siteSettings";

/**
 * Sipariş tutarlarını SUNUCUDA yeniden hesaplar.
 *
 * Bunun neden zorunlu olduğu: sipariş oluşturma ucu herkese açıktır ve
 * istemciden gelen gövdeye güvenilemez. Önceden `total_amount` doğrudan
 * istek gövdesindeki `grandTotal` alanından yazılıyordu. Bu, şu saldırıyı
 * mümkün kılıyordu:
 *
 *   1. Saldırgan ₺5.000'lik bir ürünle sipariş isteği hazırlar fakat
 *      gövdeye `grandTotal: 1` yazar.
 *   2. Sipariş veri tabanına 1 TL olarak kaydedilir.
 *   3. PayTR ödeme tutarı bu kayıttan üretildiği için saldırgan 1 TL öder.
 *   4. Bildirimdeki tahsilat (1 TL) veri tabanındaki tutara (1 TL) eşit
 *      olduğu için tutar uyuşmazlığı uyarısı da TETİKLENMEZ.
 *   5. Sipariş "Ödendi" görünür, stok düşer, işletmeye "Yeni Sipariş
 *      (Ödendi)" bildirimi gider ve ₺5.000'lik aranjman hazırlanıp
 *      teslim edilir.
 *
 * Callback'teki tutar karşılaştırması bu saldırıyı yakalayamaz: karşılaştırma
 * PayTR'nin bildirdiği tutar ile veri tabanındaki tutar arasında yapılıyor,
 * veri tabanındaki tutar ise saldırganın yazdığı değer. Tek doğru çözüm
 * tutarı hiç istemciden almamaktır.
 *
 * İstemciden yalnızca ŞUNLAR kabul edilir: hangi ürün (`productId`), kaç
 * adet (`qty`) ve varsa kupon kodu. Fiyat, indirim, kargo ve toplam
 * tamamen veri tabanından üretilir.
 */

/** Tek satırda en fazla adet — sipariş formunda gerçekçi üst sınır. */
const MAX_QTY_PER_LINE = 50;
/** Sepette en fazla farklı ürün. */
const MAX_LINES = 50;

export interface PricedItem {
  productId: string;
  name: string;
  qty: number;
  /** Birim fiyat — veri tabanından, indirimli fiyat varsa o. */
  price: number;
}

export interface PricedOrder {
  items: PricedItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  kapidaFee: number;
  grandTotal: number;
}

export type PriceOrderResult =
  | { ok: true; order: PricedOrder }
  | { ok: false; error: string; status: number };

interface ProductRow {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  is_active: boolean | null;
  stock: number | null;
}

/** İstemci gövdesinden yalnızca ürün kimliği ve adet ayıklanır. */
function parseRequestedItems(
  raw: unknown
): { ok: true; items: { productId: string; qty: number }[] } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "Sepetiniz boş görünüyor." };
  }
  if (raw.length > MAX_LINES) {
    return { ok: false, error: "Sepette çok fazla farklı ürün var." };
  }

  const birlesik = new Map<string, number>();
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, error: "Geçersiz sepet verisi." };
    }
    const { productId, qty } = entry as { productId?: unknown; qty?: unknown };

    if (typeof productId !== "string" || productId.trim() === "") {
      // Ürün kimliği olmayan satır fiyatlanamaz; istemciden gelen ada ve
      // fiyata güvenip sipariş oluşturmak tam olarak kapatmaya çalıştığımız
      // açığın kendisi olurdu.
      return { ok: false, error: "Sepette tanımlanamayan bir ürün var. Sepetinizi yenileyin." };
    }
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      return { ok: false, error: "Ürün adedi geçersiz." };
    }

    // Aynı ürün birden çok satırda gönderilirse tek satırda toplanır;
    // aksi hâlde stok kontrolü satır satır yapılıp toplamda stok aşılabilir.
    birlesik.set(productId, (birlesik.get(productId) ?? 0) + qty);
  }

  for (const [, qty] of birlesik) {
    if (qty > MAX_QTY_PER_LINE) {
      return { ok: false, error: "Ürün adedi geçersiz." };
    }
  }

  return { ok: true, items: [...birlesik].map(([productId, qty]) => ({ productId, qty })) };
}

/** İki ondalığa yuvarlar — kuruş hatalarının birikmesini önler. */
function kurus(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function priceOrder(params: {
  items: unknown;
  couponCode?: unknown;
  paymentMethod: unknown;
}): Promise<PriceOrderResult> {
  const parsed = parseRequestedItems(params.items);
  if (!parsed.ok) return { ok: false, error: parsed.error, status: 400 };

  const sb = createServerClient();

  const { data: rows, error } = await sb
    .from("products")
    .select("id, name, price, sale_price, is_active, stock")
    .in("id", parsed.items.map((i) => i.productId));

  if (error) {
    console.error("[order-pricing] ürünler okunamadı:", error.message);
    return { ok: false, error: "Sipariş şu anda alınamıyor. Lütfen tekrar deneyin.", status: 503 };
  }

  const urunler = new Map((rows ?? []).map((r) => [r.id, r as ProductRow]));

  const items: PricedItem[] = [];
  for (const istek of parsed.items) {
    const urun = urunler.get(istek.productId);

    // Var olmayan ürün: sepet eskimiş olabilir ya da kimlik uydurulmuştur.
    if (!urun) {
      return {
        ok: false,
        error: "Sepetinizdeki bir ürün artık satışta değil. Sepetinizi yenileyip tekrar deneyin.",
        status: 409,
      };
    }
    if (urun.is_active === false) {
      return { ok: false, error: `"${urun.name}" şu anda satışta değil.`, status: 409 };
    }

    // Stok kontrolü burada yapılır: fiyatlama ile aynı sorguyu paylaştığı
    // için ek bir tur gerektirmiyor ve sipariş kaydından ÖNCE çalışıyor.
    const stok = urun.stock ?? 0;
    if (stok < istek.qty) {
      return {
        ok: false,
        error:
          stok === 0
            ? `"${urun.name}" ürününün stoğu tükendi.`
            : `"${urun.name}" ürününden yalnızca ${stok} adet kalmış.`,
        status: 409,
      };
    }

    // Fiyat DAİMA veri tabanından; istemciden gelen fiyat hiç okunmuyor.
    const birim = urun.sale_price != null ? Number(urun.sale_price) : Number(urun.price);
    if (!Number.isFinite(birim) || birim < 0) {
      console.error(`[order-pricing] ${urun.id} ürününün fiyatı geçersiz: ${birim}`);
      return { ok: false, error: "Sipariş şu anda alınamıyor.", status: 503 };
    }

    items.push({ productId: urun.id, name: urun.name, qty: istek.qty, price: kurus(birim) });
  }

  const subtotal = kurus(items.reduce((s, i) => s + i.price * i.qty, 0));

  /* Kupon yeniden doğrulanır. Önceden indirim tutarı istemciden geliyordu,
     yani hiç kupon kullanmadan istediği indirimi yazmak mümkündü. */
  let discount = 0;
  let couponCode: string | null = null;
  const kod = typeof params.couponCode === "string" ? params.couponCode.toUpperCase().trim() : "";

  if (kod) {
    const { data: kupon } = await sb
      .from("coupons")
      .select("code, type, value, min_order, expiry, is_active")
      .eq("code", kod)
      .eq("is_active", true)
      .maybeSingle();

    // Geçersiz kupon siparişi reddetmez, yalnızca indirim uygulanmaz.
    // Müşteriyi ödeme adımında engellemek yerine tutarı doğru hesaplamak
    // yeterli; sipariş özetinde gördüğü tutar da bu olacaktır.
    if (kupon && (!kupon.expiry || new Date(kupon.expiry) >= new Date())) {
      const minOrder = Number(kupon.min_order ?? 0);
      if (subtotal >= minOrder) {
        const ham =
          kupon.type === "percent"
            ? (subtotal * Number(kupon.value)) / 100
            : Number(kupon.value);
        // İndirim sepet toplamını aşamaz — aksi hâlde toplam eksiye düşer.
        discount = kurus(Math.min(Math.max(ham, 0), subtotal));
        couponCode = kupon.code;
      }
    }
  }

  const [siteSettings, paymentSettings] = await Promise.all([
    getSiteSettings(),
    getPaymentSettings(),
  ]);

  /* Kargo: hizmet verilen bölgenin tamamında sabit ücret, belirlenen tutarın
     üzerinde ücretsiz. Eşik indirim ÖNCESİ tutara göre değerlendirilir
     (bkz. lib/shippingService.ts ve Teslimat Bilgileri m.4). */
  const shippingFee =
    siteSettings.freeShippingThreshold > 0 && subtotal >= siteSettings.freeShippingThreshold
      ? 0
      : kurus(siteSettings.baseShippingFee);

  /* Ödeme yöntemi de doğrulanır: kapalı bir yöntemle sipariş oluşturmak
     mümkün olmamalı. Örneğin kart kapalıyken kartla sipariş oluşturulursa
     müşteri ödeme yapamayacağı bir siparişle kalır. */
  const yontem = typeof params.paymentMethod === "string" ? params.paymentMethod : "";
  const izinli =
    (yontem === "kart" && paymentSettings.kart_enabled) ||
    (yontem === "havale" && paymentSettings.havale_enabled) ||
    (yontem === "kapida" && paymentSettings.kapida_enabled);

  if (!izinli) {
    return {
      ok: false,
      error: "Seçtiğiniz ödeme yöntemi şu anda kullanılamıyor. Lütfen başka bir yöntem seçin.",
      status: 409,
    };
  }

  const kapidaFee =
    yontem === "kapida" ? kurus(Number(paymentSettings.kapida_fee ?? 0)) : 0;

  const grandTotal = kurus(subtotal - discount + shippingFee + kapidaFee);

  if (grandTotal <= 0) {
    // Tahsil edilecek tutar sıfır veya eksi olamaz; PayTR de reddeder.
    console.error(`[order-pricing] geçersiz toplam: ${grandTotal} (ara toplam ${subtotal})`);
    return { ok: false, error: "Sipariş tutarı hesaplanamadı.", status: 400 };
  }

  return {
    ok: true,
    order: { items, subtotal, discount, couponCode, shippingFee, kapidaFee, grandTotal },
  };
}
