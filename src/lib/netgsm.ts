const NETGSM_SEND_URL = "https://api.netgsm.com.tr/sms/rest/v2/send";

/** NetGSM, telefon numarasını başında 0/90 olmadan 10 haneli bekler (5XXXXXXXXX). */
function toNetgsmPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);
  return digits;
}

/**
 * NetGSM yanıt kodları.
 *
 * Yalnızca "00" başarıdır; diğer her kod gönderimin YAPILMADIĞI anlamına
 * gelir. Kodları burada Türkçeye çeviriyoruz çünkü kuru bir "40" değeri
 * günlükte görüldüğünde neyin yanlış olduğunu anlatmıyor — oysa kurulum
 * sırasında en sık karşılaşılan hata tam olarak 40'tır ve çözümü nettir:
 * NETGSM_HEADER, panelde onaylanmış Gönderici Adı ile birebir aynı olmalı.
 */
const RESPONSE_CODES: Record<string, string> = {
  "00": "Gönderim başarılı.",
  "20": "Mesaj metni hatalı veya karakter sınırı aşıldı.",
  "30": "Kullanıcı adı veya şifre hatalı (NETGSM_USERCODE / NETGSM_PASSWORD).",
  "40": "Mesaj başlığı (Gönderici Adı) sistemde tanımlı değil. NETGSM_HEADER değeri, NetGSM panelinde ONAYLANMIŞ başlıkla birebir aynı olmalı.",
  "50": "Hesapta yeterli kredi yok.",
  "51": "Aboneliğinizde tanımlı gönderim paketi bulunamadı.",
  "70": "İstek biçimi hatalı — zorunlu bir alan eksik veya yanlış.",
  "80": "Gönderim sınırı aşıldı.",
  "85": "Aynı numaraya izin verilenden fazla tekrar gönderim yapıldı.",
};

export interface SendSmsResult {
  success: boolean;
  error?: string;
  /** NetGSM iş numarası — destek talebi açılırsa bu numara isteniyor. */
  jobId?: string;
  /** Ham yanıt kodu; günlük ve teşhis için. */
  code?: string;
}

/**
 * NetGSM üzerinden SMS gönderir. Hiçbir zaman exception fırlatmaz — ağ
 * hatası, eksik kimlik bilgisi veya NetGSM'den gelen bir hata durumunda
 * bile { success: false, error } döner ve hatayı konsola loglar, çağıran
 * kod (örn. sipariş durumu güncelleme akışı) bu yüzden asla çökmez.
 *
 * Başarı iki koşula birlikte bağlanıyor: HTTP yanıtının başarılı olması VE
 * gövdedeki `code` alanının "00" olması. Yalnızca HTTP durumuna bakmak
 * yetersiz: NetGSM'in resmî istemcisi hataları HTTP 406 ile döndürdüğünü
 * belirtiyor, fakat kimi hata durumlarında 200 ile gövdede kod dönme
 * ihtimali kapatılmış değil. Bu akışta yanlış "başarılı" sonucu pahalıya
 * geliyor: görsel onay SMS'i gitmediği hâlde gönderilmiş sayılırsa
 * müşteri fotoğrafı hiç görmez, 15 dakikalık süre dolar ve sipariş
 * kendiliğinden onaylanmış kabul edilir.
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<SendSmsResult> {
  const { NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_HEADER } = process.env;

  if (!NETGSM_USERCODE || !NETGSM_PASSWORD || !NETGSM_HEADER) {
    const error =
      "NetGSM ortam değişkenleri eksik (NETGSM_USERCODE / NETGSM_PASSWORD / NETGSM_HEADER).";
    console.error(`[netgsm] ${error}`);
    return { success: false, error };
  }

  const no = toNetgsmPhone(phoneNumber);
  if (!/^5\d{9}$/.test(no)) {
    // Geçersiz numarayı göndermek kredi harcayıp kod 20/70 ile dönüyor;
    // burada durdurmak hem masrafı hem anlamsız hata günlüğünü önlüyor.
    const error = `Telefon numarası geçersiz: "${phoneNumber}" → "${no}" (5XXXXXXXXX bekleniyor).`;
    console.error(`[netgsm] ${error}`);
    return { success: false, error };
  }

  try {
    const auth = Buffer.from(`${NETGSM_USERCODE}:${NETGSM_PASSWORD}`).toString("base64");

    const res = await fetch(NETGSM_SEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        msgheader: NETGSM_HEADER,
        encoding: "TR",
        messages: [{ msg: message, no }],
      }),
      cache: "no-store",
    });

    const raw = await res.text().catch(() => "");

    let body: { code?: unknown; jobid?: unknown; description?: unknown } = {};
    try {
      body = JSON.parse(raw) as typeof body;
    } catch {
      /* JSON değilse aşağıda ham metinle raporlanır */
    }

    const code = body.code != null ? String(body.code) : undefined;
    const jobId = body.jobid != null ? String(body.jobid) : undefined;

    if (code === "00") {
      console.log(`[netgsm] gönderildi — jobid ${jobId ?? "?"}`);
      return { success: true, jobId, code };
    }

    // Buraya düşen her durum başarısızlıktır: hatalı kod, kod hiç
    // dönmemesi veya HTTP hatası.
    const aciklama =
      (code && RESPONSE_CODES[code]) ||
      (typeof body.description === "string" ? body.description : "") ||
      raw.slice(0, 200) ||
      "NetGSM yanıt gövdesi boş.";

    const error = code
      ? `NetGSM hata kodu ${code}: ${aciklama}`
      : `NetGSM gönderimi doğrulanamadı (HTTP ${res.status}): ${aciklama}`;

    console.error(`[netgsm] ${error}`);
    return { success: false, error, code };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Bilinmeyen hata.";
    console.error(`[netgsm] beklenmedik hata: ${error}`);
    return { success: false, error };
  }
}
