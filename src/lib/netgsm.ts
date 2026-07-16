const NETGSM_SEND_URL = "https://api.netgsm.com.tr/sms/rest/v2/send";

/** NetGSM, telefon numarasını başında 0/90 olmadan 10 haneli bekler (5XXXXXXXXX). */
function toNetgsmPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);
  return digits;
}

export interface SendSmsResult {
  success: boolean;
  error?: string;
}

/**
 * NetGSM üzerinden SMS gönderir. Hiçbir zaman exception fırlatmaz — ağ
 * hatası, eksik kimlik bilgisi veya NetGSM'den gelen bir hata durumunda
 * bile { success: false, error } döner ve hatayı konsola loglar, çağıran
 * kod (örn. sipariş durumu güncelleme akışı) bu yüzden asla çökmez.
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<SendSmsResult> {
  const { NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_HEADER } = process.env;

  if (!NETGSM_USERCODE || !NETGSM_PASSWORD || !NETGSM_HEADER) {
    const error =
      "NetGSM ortam değişkenleri eksik (NETGSM_USERCODE / NETGSM_PASSWORD / NETGSM_HEADER).";
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
        messages: [{ msg: message, no: toNetgsmPhone(phoneNumber) }],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const error = `NetGSM SMS gönderimi başarısız (HTTP ${res.status}): ${text}`;
      console.error(`[netgsm] ${error}`);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Bilinmeyen hata.";
    console.error(`[netgsm] beklenmedik hata: ${error}`);
    return { success: false, error };
  }
}
