import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const sb = createServerClient();
    const { data: authData, error: authErr } = await sb.auth.getUser(accessToken);
    if (authErr || !authData?.user?.email) {
      return NextResponse.json({ error: "Google oturumu doğrulanamadı." }, { status: 401 });
    }

    const email = authData.user.email.toLowerCase().trim();
    const name =
      (authData.user.user_metadata?.full_name as string | undefined) ??
      (authData.user.user_metadata?.name as string | undefined) ??
      email.split("@")[0];

    const { data: existing } = await sb
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    let userId: string;

    if (existing) {
      userId = existing.id;
    } else {
      // Google ile ilk kez giriş yapan kullanıcı için hesap oluşturulur.
      // Rastgele, tahmin edilemez bir şifre hash'i konur — şifre ile giriş
      // ancak "Şifremi Unuttum" akışıyla yeni bir şifre belirlendikten sonra mümkün olur.
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const passwordHash = await hashPassword(randomPassword);

      const { data: created, error: createErr } = await sb
        .from("users")
        .insert({ email, name, password_hash: passwordHash, kvkk_consent: true })
        .select("id")
        .single();

      if (createErr || !created) {
        console.error("[auth/oauth-callback] DB error:", createErr);
        return NextResponse.json({ error: "Hesap oluşturulamadı." }, { status: 500 });
      }
      userId = created.id;
    }

    await setSessionCookie(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/oauth-callback] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik bir hata oluştu." }, { status: 500 });
  }
}
