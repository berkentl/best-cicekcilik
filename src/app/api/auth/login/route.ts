import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const sb = createServerClient();

    const { data: user, error } = await sb
      .from("users")
      .select("id, name, email, phone, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }

    await setSessionCookie(user.id);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } catch (err) {
    console.error("[auth/login] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik bir hata oluştu." }, { status: 500 });
  }
}
