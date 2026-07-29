import crypto from "node:crypto";

/**
 * PayTR iFrame API istemcisi.
 *
 * Neden iFrame API (Direct API değil): kart verisi hiçbir zaman bizim
 * sunucumuza uğramaz, ödeme formu PayTR'nin alan adında açılır. Böylece
 * PCI DSS yükümlülüğü PayTR'de kalır. Direct API'de kart numarası bizim
 * isteğimizden geçeceği için tüm PCI kapsamı bize geçerdi.
 *
 * Akış:
 *   1. Sunucu tarafında get-token çağrılır, iframe_token alınır.
 *   2. Token ile PayTR'nin ödeme sayfası iframe içinde gösterilir.
 *   3. Sonuç, tarayıcıdan değil PayTR sunucusundan Bildirim URL'sine POST
 *      edilir (bkz. api/payment/paytr/callback).
 *
 * Yönlendirme (merchant_ok_url) ödemenin kanıtı DEĞİLDİR — kullanıcı o
 * adrese elle de gidebilir. Sipariş yalnızca callback'te PAID'e geçer.
 */

const TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
export const PAYTR_IFRAME_BASE = "https://www.paytr.com/odeme/guvenli";

/** PayTR "TRY" değil "TL" bekler; TRY gönderildiğinde token isteği reddedilir. */
const CURRENCY = "TL";

/**
 * Taksit kapalı. Ticari karar: çiçek tutarlarında taksit anlamsız ve komisyon
 * yükü getiriyor. Yan faydası, vade farkı hiç oluşmadığı için callback'teki
 * total_amount'ın her zaman payment_amount'a eşit olması — faturaya yazılacak
 * tutarda belirsizlik kalmıyor.
 */
const NO_INSTALLMENT = "1";
/** no_installment=1 iken anlamı yok; 0 = mağaza panelindeki üst sınır. */
const MAX_INSTALLMENT = "0";

export interface PaytrCredentials {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
}

/**
 * Ortam değişkenlerini okur.
 *
 * PAYTR_TEST_MODE bilinçli olarak "test" tarafına varsayılıyor: değişken hiç
 * tanımlanmamışsa test modunda kalır. Ters varsayım, mağaza henüz canlı moda
 * geçmemişken gerçek ödeme almaya çalışıp her işlemi hataya düşürürdü.
 * Canlıya geçerken PAYTR_TEST_MODE=0 açıkça yazılmalıdır.
 */
export function getPaytrCredentials(): PaytrCredentials | null {
  const { PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT, PAYTR_TEST_MODE } =
    process.env;

  if (!PAYTR_MERCHANT_ID || !PAYTR_MERCHANT_KEY || !PAYTR_MERCHANT_SALT) return null;

  return {
    merchantId: PAYTR_MERCHANT_ID,
    merchantKey: PAYTR_MERCHANT_KEY,
    merchantSalt: PAYTR_MERCHANT_SALT,
    testMode: PAYTR_TEST_MODE !== "0",
  };
}

/** Tutarı PayTR'nin beklediği kuruş cinsinden tam sayıya çevirir. */
export function toKurus(amount: number): number {
  return Math.round(amount * 100);
}

export interface BasketLine {
  name: string;
  unitPrice: number;
  qty: number;
}

/**
 * Sepeti PayTR'nin beklediği base64(JSON) biçimine çevirir.
 *
 * Biçim: [[ürün adı, birim fiyat (metin), adet], ...]. Fiyatlar iki ondalıklı
 * metin olarak gönderilir; sayı olarak gönderildiğinde PayTR bazı tutarlarda
 * kayan nokta gösterimi üretiyor.
 *
 * Satır adları
 * PayTR ödeme ekranında müşteriye gösterildiği için sipariştekiyle aynı
 * tutulur — farklı bir ad göstermek 6502 sayılı Kanun m.48 bakımından
 * yanıltıcı olurdu.
 */
export function encodeBasket(lines: BasketLine[]): string {
  const payload = lines.map((l) => [l.name, l.unitPrice.toFixed(2), l.qty]);
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

export interface CreateTokenParams {
  merchantOid: string;
  email: string;
  /** Tahsil edilecek toplam tutar (TL, kuruş çevrimi burada yapılır). */
  amount: number;
  basket: BasketLine[];
  userIp: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  okUrl: string;
  failUrl: string;
  /** Ödeme formunun geçerli kalacağı süre (dakika). */
  timeoutMinutes?: number;
}

export type CreateTokenResult =
  | { ok: true; token: string; testMode: boolean }
  | { ok: false; error: string };

/**
 * PayTR'den iframe_token alır.
 *
 * paytr_token, gövdeyle gönderilen değerlerin AYNISINDAN üretilmelidir —
 * özellikle user_basket, hash'e giren base64 metnin birebir kendisi olmalı.
 * Sepeti iki kez kodlamak (biri hash, biri gövde için) sıralama farkından
 * dolayı sessizce geçersiz imza üretebilir; bu yüzden tek bir değişkende
 * tutuluyor.
 */
export async function createPaytrToken(
  params: CreateTokenParams
): Promise<CreateTokenResult> {
  const creds = getPaytrCredentials();
  if (!creds) {
    return {
      ok: false,
      error:
        "PayTR ortam değişkenleri eksik (PAYTR_MERCHANT_ID / PAYTR_MERCHANT_KEY / PAYTR_MERCHANT_SALT).",
    };
  }

  const paymentAmount = String(toKurus(params.amount));
  const userBasket = encodeBasket(params.basket);
  const testMode = creds.testMode ? "1" : "0";

  const hashStr =
    creds.merchantId +
    params.userIp +
    params.merchantOid +
    params.email +
    paymentAmount +
    userBasket +
    NO_INSTALLMENT +
    MAX_INSTALLMENT +
    CURRENCY +
    testMode;

  const paytrToken = crypto
    .createHmac("sha256", creds.merchantKey)
    .update(hashStr + creds.merchantSalt)
    .digest("base64");

  const body = new URLSearchParams({
    merchant_id: creds.merchantId,
    user_ip: params.userIp,
    merchant_oid: params.merchantOid,
    email: params.email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: "1",
    no_installment: NO_INSTALLMENT,
    max_installment: MAX_INSTALLMENT,
    user_name: params.userName,
    user_address: params.userAddress,
    user_phone: params.userPhone,
    merchant_ok_url: params.okUrl,
    merchant_fail_url: params.failUrl,
    timeout_limit: String(params.timeoutMinutes ?? 30),
    currency: CURRENCY,
    test_mode: testMode,
    lang: "tr",
  });

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    const raw = await res.text();

    let data: { status?: string; token?: string; reason?: string };
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      console.error(`[paytr] token yanıtı JSON değil (HTTP ${res.status}): ${raw.slice(0, 400)}`);
      return { ok: false, error: "PayTR'den beklenmeyen bir yanıt alındı." };
    }

    if (data.status !== "success" || !data.token) {
      // reason PayTR'nin döndürdüğü teknik gerekçe; müşteriye gösterilmez,
      // sunucu günlüğüne yazılır ki kurulum hataları teşhis edilebilsin.
      console.error(`[paytr] token alınamadı: ${data.reason ?? raw.slice(0, 400)}`);
      return { ok: false, error: data.reason ?? "Ödeme oturumu başlatılamadı." };
    }

    return { ok: true, token: data.token, testMode: creds.testMode };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata.";
    console.error(`[paytr] token isteği başarısız: ${message}`);
    return { ok: false, error: "PayTR'ye bağlanılamadı." };
  }
}

/**
 * Bildirim (callback) imzasını doğrular.
 *
 * Bu doğrulama atlanırsa herkes callback ucuna elle `status=success` POST
 * ederek ödeme yapmadan sipariş onaylatabilir; uç, PayTR sunucusundan
 * çağrıldığı için kimlik doğrulaması olmadan açık tutulmak zorundadır ve
 * tek güvenlik katmanı budur.
 *
 * Karşılaştırma timingSafeEqual ile yapılır: düz `!==` karşılaştırması
 * eşleşmeyen ilk baytta döndüğü için imza baytlarını tek tek tahmin etmeye
 * yarayan bir zamanlama kanalı bırakır.
 */
export function verifyCallbackHash(post: {
  merchant_oid: string;
  status: string;
  total_amount: string;
  hash: string;
}): boolean {
  const creds = getPaytrCredentials();
  if (!creds) {
    console.error("[paytr] callback doğrulanamadı: kimlik bilgileri eksik.");
    return false;
  }

  const expected = crypto
    .createHmac("sha256", creds.merchantKey)
    .update(post.merchant_oid + creds.merchantSalt + post.status + post.total_amount)
    .digest("base64");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(post.hash ?? "", "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
