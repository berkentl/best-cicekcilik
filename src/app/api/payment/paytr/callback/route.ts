import { after } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createNotification } from "@/lib/notifications";
import { verifyCallbackHash, toKurus } from "@/lib/paytr";
import { fulfillOrder, type FulfillableOrder } from "@/lib/order-fulfillment";

/**
 * PayTR Bildirim (callback) ucu.
 *
 * Ödemenin tek geçerli kanıtı budur. Müşterinin tarayıcısı merchant_ok_url'e
 * yönlendirildi diye sipariş ödenmiş sayılmaz — o adrese herkes elle
 * gidebilir. Bu uç PayTR'nin sunucusundan çağrılır.
 *
 * Üç kural mevzuat değil, PayTR sözleşmesi gereği zorunludur:
 *
 *  1. İmza doğrulanmalı. Doğrulanmazsa bu uç kimlik doğrulaması olmadan
 *     açık olduğu için herkes `status=success` POST edip bedava sipariş
 *     alabilir.
 *  2. Yanıt gövdesi tam olarak "OK" olmalı — HTML, boşluk, satır sonu
 *     eklenmemeli. Aksi hâlde PayTR bildirimi başarısız sayıp tekrar dener.
 *  3. İşlem idempotent olmalı. Ağ sorunlarında aynı bildirim birden çok
 *     kez gelebilir; sipariş önce durumundan kontrol edilir.
 *
 * Uç, proxy.ts'teki yetki denetimine BİLİNÇLİ olarak dâhil edilmemiştir;
 * çağrı tarayıcıdan değil PayTR sunucusundan geldiği için oturum çerezi
 * taşımaz.
 */

/** PayTR'nin bildirimi tekrar denemesi için başarısız yanıt. */
function fail(reason: string, status = 400) {
  console.error(`[paytr-callback] ${reason}`);
  return new Response(`PAYTR notification failed: ${reason}`, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** PayTR'nin bildirimi kapatması için tek geçerli yanıt. */
function ok() {
  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  let post: Record<string, string>;
  try {
    const form = await request.formData();
    post = Object.fromEntries(
      [...form.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""])
    );
  } catch {
    return fail("gövde okunamadı");
  }

  const merchantOid = post.merchant_oid ?? "";
  const status = post.status ?? "";
  const totalAmount = post.total_amount ?? "";

  if (!merchantOid || !status || !totalAmount || !post.hash) {
    return fail("zorunlu alanlar eksik");
  }

  if (!verifyCallbackHash({ merchant_oid: merchantOid, status, total_amount: totalAmount, hash: post.hash })) {
    // İmza geçersiz. Bu ya kimlik bilgilerinin yanlış yapılandırılmasıdır ya
    // da sahte bir istektir; her iki hâlde sipariş kesinlikle işlenmemelidir.
    return fail("bad hash");
  }

  const sb = createServerClient();

  const { data: order, error: readError } = await sb
    .from("orders")
    .select(
      "id, order_number, email, customer_name, items, total_amount, address, delivery_date, delivery_time, recipient_name, card_message, payment_status, payment_method"
    )
    .eq("order_number", merchantOid)
    .maybeSingle();

  if (readError) {
    // Geçici veri tabanı hatası — PayTR tekrar denemeli, yoksa ödeme
    // alınmış ama siparişe işlenmemiş olarak kalır.
    return fail(`veri tabanı okunamadı: ${readError.message}`, 500);
  }

  if (!order) {
    // Sipariş yok. Tekrar denemek durumu değiştirmeyeceği için her hâlükârda
    // OK dönüp bildirimi kapatıyoruz.
    //
    // Yönetici uyarısı YALNIZCA status=success için üretilir. PayTR, ödeme
    // oturumu terk edildiğinde veya süresi dolduğunda da bildirim gönderiyor
    // ve bunlar status=failed geliyor; hiçbir tahsilat yapılmadığı için
    // mutabakat gerektirmiyorlar. Bunlara da uyarı üretmek yönetici
    // bildirimlerini boğuyor ve asıl tehlikeli hâli — para tahsil edilmiş
    // ama karşılığında sipariş yok — görünmez hâle getiriyor.
    if (status === "success") {
      console.error(`[paytr-callback] TAHSİLAT var ama sipariş yok: ${merchantOid}`);
      after(() =>
        createNotification({
          type: "payment_orphan",
          title: "Karşılığı Olmayan Ödeme Bildirimi",
          message:
            `PayTR "${merchantOid}" numaralı sipariş için TAHSİLAT bildirdi fakat bu numarada sipariş bulunamadı. ` +
            `PayTR panelinden kontrol edilip müşteriye iade veya sipariş oluşturulması gerekir.`,
          data: { merchantOid, status, totalAmount },
        })
      );
    } else {
      console.warn(
        `[paytr-callback] karşılığı olmayan başarısız bildirim yok sayıldı: ${merchantOid} (${post.failed_reason_msg ?? "gerekçe yok"})`
      );
    }
    return ok();
  }

  // Idempotans — aynı bildirim tekrar gelirse hiçbir şey yapmadan OK dönülür.
  if (order.payment_status === "PAID") {
    console.warn(`[paytr-callback] ${merchantOid} zaten PAID, yinelenen bildirim yok sayıldı.`);
    return ok();
  }

  if (status !== "success") {
    // Başarısız denemeler olağandır (yetersiz bakiye, hatalı CVV, 3D iptali).
    // Bildirim üretilmez; yalnızca gerekçe kaydedilir, sipariş PENDING kalır
    // ve müşteri yeniden denemekte serbesttir.
    const reason = [post.failed_reason_code, post.failed_reason_msg]
      .filter(Boolean)
      .join(" — ") || "PayTR gerekçe bildirmedi";

    const { error } = await sb
      .from("orders")
      .update({ paytr_failed_reason: reason.slice(0, 500) })
      .eq("id", order.id);

    if (error) return fail(`başarısızlık kaydedilemedi: ${error.message}`, 500);

    console.warn(`[paytr-callback] ${merchantOid} ödeme başarısız: ${reason}`);
    return ok();
  }

  /* --- Başarılı ödeme --- */

  const collectedKurus = Number.parseInt(totalAmount, 10);
  const expectedKurus = toKurus(Number(order.total_amount));
  // Taksit kapalı olduğu için vade farkı oluşmaz; tutarlar eşit olmalı.
  const amountMismatch =
    Number.isFinite(collectedKurus) && collectedKurus !== expectedKurus;

  /*
    Güncelleme `payment_status <> 'PAID'` koşuluna bağlanıyor ve etkilenen
    satır geri isteniyor. Bunun nedeni yarış durumu: yukarıdaki idempotans
    kontrolü ile bu güncelleme arasında ikinci bir bildirim gelirse, iki
    istek de siparişi PENDING okuyup ikisi de stok düşümünü çalıştırabilir.
    Koşullu güncelleme bunu veri tabanı düzeyinde tekilleştirir — yalnızca
    satırı fiilen PAID'e çeviren istek yan etkileri tetikler.
  */
  const { data: claimed, error: updateError } = await sb
    .from("orders")
    .update({
      payment_status: "PAID",
      paid_at: new Date().toISOString(),
      payment_provider: "paytr",
      paytr_payment_type: post.payment_type ?? null,
      paytr_test_mode: post.test_mode === "1",
      paytr_total_amount: Number.isFinite(collectedKurus) ? collectedKurus / 100 : null,
      paytr_failed_reason: null,
    })
    .eq("id", order.id)
    .neq("payment_status", "PAID")
    .select("id");

  if (updateError) {
    // Para tahsil edildi ama siparişe işlenemedi — PayTR'nin tekrar denemesi
    // şart, bu yüzden OK dönülmüyor.
    return fail(`sipariş güncellenemedi: ${updateError.message}`, 500);
  }

  if (!claimed || claimed.length === 0) {
    // Eşzamanlı başka bir bildirim siparişi zaten PAID'e çekmiş; yan etkiler
    // o istekte çalışıyor, burada tekrarlanmamalı.
    console.warn(`[paytr-callback] ${merchantOid} eşzamanlı bildirimle zaten işlenmiş.`);
    return ok();
  }

  after(async () => {
    /*
      Stok düşümü, yönetici bildirimi, push ve müşteri onay e-postası
      kartla ödemede BURADA çalışır — sipariş kaydında değil. Müşteri ödeme
      formunda veya 3D Secure ekranında vazgeçebildiği için, tahsilat
      doğrulanmadan stok düşmek terk edilen her sepette satış kaybı
      doğuruyordu (bkz. lib/order-fulfillment.ts).
    */
    await fulfillOrder(order as FulfillableOrder, {
      siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://dunyanincicegi.com",
      paymentConfirmed: true,
      testMode: post.test_mode === "1",
    });

    // Tutar uyuşmazlığı ayrı bir bildirimle yükseltilir: ödeme gerçekten
    // alındığı için sipariş PAID'e geçirilir (aksi hâlde parası ödenmiş
    // sipariş ödenmemiş görünürdü), fakat faturaya yazılacak tutar ile
    // tahsil edilen tutar farklı olduğundan muhasebe müdahalesi gerekir.
    if (amountMismatch) {
      await createNotification({
        type: "payment_amount_mismatch",
        title: "Ödeme Tutarı Sipariş Tutarıyla Uyuşmuyor",
        message:
          `${order.order_number}: sipariş tutarı ₺${(expectedKurus / 100).toLocaleString("tr-TR")}, ` +
          `PayTR'den bildirilen tahsilat ₺${(collectedKurus / 100).toLocaleString("tr-TR")}. ` +
          `Fatura kesilmeden önce kontrol edilmelidir.`,
        data: {
          orderId: order.id,
          orderNumber: order.order_number,
          expected: expectedKurus / 100,
          collected: collectedKurus / 100,
        },
      });
    }
  });

  console.log(
    `[paytr-callback] ${merchantOid} ödendi (${post.payment_type ?? "?"}, test=${post.test_mode ?? "0"}).`
  );
  return ok();
}

/**
 * PayTR yalnızca POST gönderir. GET, panelde Bildirim URL'sini elle test
 * edenler için anlaşılır bir yanıt döndürür — 404 gördüklerinde adresin
 * yanlış olduğunu düşünüyorlar.
 */
export function GET() {
  return new Response(
    "Bu uç yalnızca PayTR bildirimlerini (POST) kabul eder.",
    { status: 405, headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
