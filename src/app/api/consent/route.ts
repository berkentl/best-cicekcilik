import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getSessionUserId, getCurrentUser } from "@/lib/auth";
import {
  logConsents,
  getClientIp,
  getUserAgent,
  type ConsentType,
  type ConsentChannel,
} from "@/lib/consent";
import { LEGAL_VERSIONS } from "@/content/legal";

/**
 * Onay kayıt uç noktası — çerez bandı, hesap ayarları ve üyelik formu
 * buraya yazar. Misafir kullanıcılar da çağırabilir (çerez onayları için
 * oturum gerekmez).
 */

/** Onay türü → hangi metnin sürümünün kaydedileceği. */
const VERSION_BY_TYPE: Record<ConsentType, string> = {
  pazarlama_eposta: LEGAL_VERSIONS.ticariElektronikIleti,
  pazarlama_sms: LEGAL_VERSIONS.ticariElektronikIleti,
  profilleme: LEGAL_VERSIONS.acikRizaMetni,
  yurtdisi_aktarim: LEGAL_VERSIONS.acikRizaMetni,
  cerez_analitik: LEGAL_VERSIONS.gizlilikVeCerezPolitikasi,
  cerez_pazarlama: LEGAL_VERSIONS.gizlilikVeCerezPolitikasi,
};

const VALID_TYPES = new Set(Object.keys(VERSION_BY_TYPE) as ConsentType[]);

const VALID_CHANNELS = new Set<ConsentChannel>([
  "uyelik_formu",
  "odeme_adimi",
  "hesap_ayarlari",
  "cerez_bandi",
]);

interface ConsentInput {
  type: ConsentType;
  granted: boolean;
}

/**
 * Oturum açmış kullanıcının güncel onay durumlarını döner.
 * Her tür için en son yazılan kayıt geçerlidir.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  try {
    const sb = createServerClient();
    const { data } = await sb
      .from("consent_logs")
      .select("consent_type, granted, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Tür başına ilk (en yeni) kayıt geçerli durumdur
    const current: Partial<Record<ConsentType, boolean>> = {};
    for (const row of data ?? []) {
      const type = row.consent_type as ConsentType;
      if (current[type] === undefined) current[type] = row.granted;
    }

    return NextResponse.json({
      pazarlama_eposta: current.pazarlama_eposta ?? false,
      pazarlama_sms: current.pazarlama_sms ?? false,
      profilleme: current.profilleme ?? false,
      yurtdisi_aktarim: current.yurtdisi_aktarim ?? false,
    });
  } catch (err) {
    console.error("[api/consent] okuma hatası:", err);
    return NextResponse.json({ error: "Onay durumu okunamadı." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { consents, channel } = body as {
      consents?: ConsentInput[];
      channel?: ConsentChannel;
    };

    if (!Array.isArray(consents) || consents.length === 0) {
      return NextResponse.json({ error: "Onay bilgisi eksik." }, { status: 400 });
    }

    if (!channel || !VALID_CHANNELS.has(channel)) {
      return NextResponse.json({ error: "Geçersiz onay kanalı." }, { status: 400 });
    }

    const invalid = consents.filter(
      (c) => !VALID_TYPES.has(c.type) || typeof c.granted !== "boolean"
    );
    if (invalid.length > 0) {
      return NextResponse.json({ error: "Geçersiz onay türü." }, { status: 400 });
    }

    // Oturum varsa kullanıcıya bağlanır; yoksa (çerez onayı gibi) anonim kalır.
    const userId = await getSessionUserId();
    const user = userId ? await getCurrentUser() : null;

    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    await logConsents(
      consents.map((c) => ({
        consentType: c.type,
        granted: c.granted,
        channel,
        textVersion: VERSION_BY_TYPE[c.type],
        userId: userId ?? null,
        email: user?.email ?? null,
        phone: user?.phone ?? null,
        ipAddress,
        userAgent,
      }))
    );

    // users.marketing_consent, "şu anki durum" için hızlı okunabilir bir
    // özet alan olarak korunuyor; tarihçe consent_logs'ta tutulur.
    // Pazarlama kanallarından herhangi biri açıksa özet alan true olur.
    if (userId) {
      const marketing = consents.filter(
        (c) => c.type === "pazarlama_eposta" || c.type === "pazarlama_sms"
      );
      if (marketing.length > 0) {
        const anyGranted = marketing.some((c) => c.granted);
        const sb = createServerClient();
        await sb
          .from("users")
          .update({ marketing_consent: anyGranted })
          .eq("id", userId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/consent] beklenmedik hata:", err);
    return NextResponse.json({ error: "Onay kaydedilemedi." }, { status: 500 });
  }
}
