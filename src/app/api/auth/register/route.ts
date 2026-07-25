import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/schemas/auth";
import {
  logConsents,
  getClientIp,
  getUserAgent,
  type ConsentRecord,
} from "@/lib/consent";
import { LEGAL_VERSIONS } from "@/content/legal";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const { name, email, phone, password, kvkkConsent, marketingConsent } = parsed.data;
    const sb = createServerClient();

    const { data: existing } = await sb
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta adresi ile kayıtlı bir hesap zaten var." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const { data: user, error } = await sb
      .from("users")
      .insert({
        name,
        email,
        phone: phone ?? "",
        password_hash: passwordHash,
        kvkk_consent: kvkkConsent,
        marketing_consent: marketingConsent ?? false,
      })
      .select("id, name, email, phone")
      .single();

    if (error || !user) {
      console.error("[auth/register] DB error:", error);
      return NextResponse.json({ error: "Hesap oluşturulamadı." }, { status: 500 });
    }

    // Pazarlama onayının ispat kaydı — users.marketing_consent yalnızca
    // "şu anki durumu" tutar; onayın hangi tarihte, hangi IP'den ve hangi
    // metin sürümüne verildiği consent_logs'ta saklanır. Bu kayıt olmadan
    // denetimde onayın varlığı ispat edilemez.
    //
    // Kutucuk işaretlenmemişse de kayıt yazılıyor (granted: false) — böylece
    // "kullanıcıya soruldu, onay vermedi" durumu da belgelenmiş olur.
    const granted = marketingConsent === true;
    const kimlik = {
      channel: "uyelik_formu" as const,
      userId: user.id,
      email: user.email,
      phone: user.phone || null,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    };

    const consentRecords: ConsentRecord[] = [
      {
        ...kimlik,
        consentType: "pazarlama_eposta",
        granted,
        textVersion: LEGAL_VERSIONS.ticariElektronikIleti,
      },
    ];

    // Pazarlama e-postası yurt dışında yerleşik sağlayıcı (Resend) üzerinden
    // iletildiği için, onay verildiğinde yurt dışı aktarım rızası da kaydedilir.
    if (granted) {
      consentRecords.push({
        ...kimlik,
        consentType: "yurtdisi_aktarim",
        granted: true,
        textVersion: LEGAL_VERSIONS.acikRizaMetni,
      });
    }

    await logConsents(consentRecords);

    await setSessionCookie(user.id);

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email, phone: user.phone },
      { status: 201 }
    );
  } catch (err) {
    console.error("[auth/register] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik bir hata oluştu." }, { status: 500 });
  }
}
