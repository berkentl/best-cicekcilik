import { createServerClient } from "@/lib/supabase-server";

/**
 * Onay kayıtları — KVKK açık rızası (m.5/1, m.9) ve 6563 sayılı Kanun
 * kapsamındaki ticari elektronik ileti onayı.
 *
 * Her onay ve geri alma işlemi ayrı bir satır olarak yazılır; kayıtlar
 * güncellenmez. Böylece onayın tarihçesi bozulmadan kalır ve denetimde
 * "hangi tarihte neye onay verildi" sorusu cevaplanabilir.
 *
 * Kalıcı silme, veri tabanı trigger'ı ile engellenmiştir
 * (bkz. scripts/migrate-consent-logs.sql).
 */

export type ConsentType =
  /** Kampanya/duyuru e-postası — 6563 + İYS */
  | "pazarlama_eposta"
  /** Kampanya/duyuru SMS'i — 6563 + İYS */
  | "pazarlama_sms"
  /** İlgi alanına göre reklam için davranış analizi — KVKK m.5/1 */
  | "profilleme"
  /** Google Analytics / GTM çerezleri */
  | "cerez_analitik"
  /** Meta Pixel / Google Ads çerezleri */
  | "cerez_pazarlama"
  /** Pazarlama amaçlı yurt dışına aktarım — KVKK m.9 */
  | "yurtdisi_aktarim";

export type ConsentChannel =
  | "uyelik_formu"
  | "odeme_adimi"
  | "hesap_ayarlari"
  | "cerez_bandi"
  | "iys";

/** İYS'ye yüklenmesi gereken onay türleri — ticari elektronik ileti onayları. */
const IYS_CONSENT_TYPES: ReadonlySet<ConsentType> = new Set([
  "pazarlama_eposta",
  "pazarlama_sms",
]);

export interface ConsentRecord {
  consentType: ConsentType;
  granted: boolean;
  channel: ConsentChannel;
  /** Onaylanan metnin sürümü — bkz. LEGAL_VERSIONS */
  textVersion: string;
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Onay kaydını veri tabanına yazar. Hiçbir zaman exception fırlatmaz —
 * onay kaydının başarısız olması, kullanıcının asıl işlemini (sipariş,
 * üyelik) engellememelidir. Başarısızlık konsola loglanır.
 */
export async function logConsent(record: ConsentRecord): Promise<void> {
  try {
    const sb = createServerClient();

    // Ticari ileti onayları İYS'ye yüklenmek üzere işaretlenir. Onay
    // alınmış fakat yüklenmemiş kayıtlar denetimde onaysız gönderim
    // sayıldığından, yükleme durumu takip edilebilir olmalıdır.
    // Geri alma (granted=false) için de İYS'ye ret bildirimi gerekir.
    const needsIys = IYS_CONSENT_TYPES.has(record.consentType);

    await sb.from("consent_logs").insert({
      user_id: record.userId ?? null,
      email: record.email?.toLowerCase().trim() ?? null,
      phone: record.phone ?? null,
      consent_type: record.consentType,
      granted: record.granted,
      channel: record.channel,
      text_version: record.textVersion,
      ip_address: record.ipAddress ?? null,
      user_agent: record.userAgent ?? null,
      iys_status: needsIys ? "beklemede" : null,
    });
  } catch (err) {
    console.error("[consent] kayıt başarısız:", err);
  }
}

/** Birden fazla onayı tek seferde yazar. */
export async function logConsents(records: ConsentRecord[]): Promise<void> {
  await Promise.allSettled(records.map((r) => logConsent(r)));
}

/**
 * Bir kişinin belirli bir onay türündeki güncel durumunu döner.
 * En son yazılan kayıt geçerli olandır.
 */
export async function getCurrentConsent(
  identity: { userId?: string | null; email?: string | null },
  consentType: ConsentType
): Promise<boolean> {
  try {
    const sb = createServerClient();
    let query = sb
      .from("consent_logs")
      .select("granted")
      .eq("consent_type", consentType)
      .order("created_at", { ascending: false })
      .limit(1);

    if (identity.userId) {
      query = query.eq("user_id", identity.userId);
    } else if (identity.email) {
      query = query.eq("email", identity.email.toLowerCase().trim());
    } else {
      return false;
    }

    const { data } = await query.maybeSingle();
    return data?.granted ?? false;
  } catch (err) {
    console.error("[consent] durum sorgusu başarısız:", err);
    return false;
  }
}

/**
 * İstek başlıklarından IP adresini çıkarır. Vercel ve benzeri vekil
 * sunucular gerçek istemci IP'sini x-forwarded-for içinde iletir; listenin
 * ilk değeri istemciye aittir.
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}

export function getUserAgent(request: Request): string | null {
  const ua = request.headers.get("user-agent");
  // Aşırı uzun user-agent değerlerini kırp — kayıt alanını şişirmesin
  return ua ? ua.slice(0, 500) : null;
}
