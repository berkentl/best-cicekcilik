import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/schemas/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const sb = createServerClient();

    const { data: user } = await sb
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    // Hesap olmasa bile aynı mesajı döneriz — hangi e-postaların kayıtlı
    // olduğunu dışarıya sızdırmamak için (user enumeration engeli).
    if (user) {
      const token = await createResetToken(user.email);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
        ? process.env.NEXT_PUBLIC_SITE_URL
        : "https://dunyanincicegi.com";
      const resetUrl = `${siteUrl}/sifre-sifirla?token=${encodeURIComponent(token)}`;
      sendPasswordResetEmail(user.email, resetUrl).catch((err) =>
        console.error("[auth/forgot-password] email send failed:", err)
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.",
    });
  } catch (err) {
    console.error("[auth/forgot-password] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik bir hata oluştu." }, { status: 500 });
  }
}
