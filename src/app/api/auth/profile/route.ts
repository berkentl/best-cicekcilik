import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getSessionUserId } from "@/lib/auth";
import { profileSchema } from "@/lib/schemas/auth";

export async function PATCH(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const { name, phone, kvkkConsent, marketingConsent } = parsed.data;
    const sb = createServerClient();

    const { data, error } = await sb
      .from("users")
      .update({
        name,
        phone: phone ?? "",
        ...(kvkkConsent !== undefined ? { kvkk_consent: kvkkConsent } : {}),
        ...(marketingConsent !== undefined ? { marketing_consent: marketingConsent } : {}),
      })
      .eq("id", userId)
      .select("id, name, email, phone, kvkk_consent, marketing_consent")
      .single();

    if (error || !data) {
      console.error("[auth/profile] DB error:", error);
      return NextResponse.json({ error: "Profil güncellenemedi." }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      kvkkConsent: data.kvkk_consent,
      marketingConsent: data.marketing_consent,
    });
  } catch (err) {
    console.error("[auth/profile] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik bir hata oluştu." }, { status: 500 });
  }
}
