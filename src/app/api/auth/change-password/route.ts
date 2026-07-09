import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getSessionUserId, hashPassword, verifyPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/schemas/auth";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    const sb = createServerClient();

    const { data: user, error: fetchErr } = await sb
      .from("users")
      .select("password_hash")
      .eq("id", userId)
      .single();

    if (fetchErr || !user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const ok = await verifyPassword(currentPassword, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Mevcut şifreniz hatalı." }, { status: 401 });
    }

    const newHash = await hashPassword(newPassword);
    const { error: updateErr } = await sb
      .from("users")
      .update({ password_hash: newHash })
      .eq("id", userId);

    if (updateErr) {
      console.error("[auth/change-password] DB error:", updateErr);
      return NextResponse.json({ error: "Şifre güncellenemedi." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/change-password] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik bir hata oluştu." }, { status: 500 });
  }
}
