import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { hashPassword, setSessionCookie, verifyResetToken } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/schemas/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const email = await verifyResetToken(token);
    if (!email) {
      return NextResponse.json(
        { error: "Bağlantının süresi dolmuş veya geçersiz. Lütfen yeniden talep edin." },
        { status: 400 }
      );
    }

    const sb = createServerClient();
    const passwordHash = await hashPassword(password);

    const { data: user, error } = await sb
      .from("users")
      .update({ password_hash: passwordHash })
      .eq("email", email)
      .select("id")
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Şifre güncellenemedi." }, { status: 500 });
    }

    await setSessionCookie(user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/reset-password] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik bir hata oluştu." }, { status: 500 });
  }
}
