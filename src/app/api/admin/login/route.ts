import { NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
  createAdminToken,
} from "@/lib/admin-session";
import { getClientIp } from "@/lib/consent";

/**
 * Yönetici girişi.
 *
 * Uç herkese açık olmak zorunda, dolayısıyla tek savunma şifrenin kendisi.
 * Üç önlem alınıyor:
 *
 * 1. Karşılaştırma sabit zamanlı. Düz `!==` eşleşmeyen ilk karakterde
 *    döndüğü için ölçülebilir bir zamanlama farkı bırakır.
 * 2. Başarısız her denemeye sabit gecikme uygulanıyor. Bu, saniyede
 *    yapılabilecek deneme sayısını doğrudan sınırlar.
 * 3. IP başına deneme sayacı tutuluyor ve eşik aşılınca kısa süre
 *    kilitleniyor.
 *
 * Sayaç bellekte tutuluyor; Vercel'de her istek farklı bir örneğe
 * düşebildiği için bu sayaç tek başına kesin bir sınır DEĞİL. Gerçek
 * koruma 2. maddedeki gecikme ile şifrenin uzunluğudur — bu yüzden
 * ADMIN_PASSWORD uzun ve rastgele olmalıdır.
 */

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000; // 10 dakika
const LOCKOUT_MS = 15 * 60 * 1000; // 15 dakika
const FAIL_DELAY_MS = 1000;

const attempts = new Map<string, { count: number; first: number; lockedUntil?: number }>();

function checkRate(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const rec = attempts.get(ip);

  if (rec?.lockedUntil && rec.lockedUntil > now) {
    return { allowed: false, retryAfterSec: Math.ceil((rec.lockedUntil - now) / 1000) };
  }
  if (rec && now - rec.first > WINDOW_MS) attempts.delete(ip);
  return { allowed: true };
}

function recordFailure(ip: string) {
  const now = Date.now();
  const rec = attempts.get(ip) ?? { count: 0, first: now };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) rec.lockedUntil = now + LOCKOUT_MS;
  attempts.set(ip, rec);

  // Sayaç sınırsız büyümesin (bellek tükenmesi).
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) {
      if (now - v.first > WINDOW_MS && !(v.lockedUntil && v.lockedUntil > now)) attempts.delete(k);
    }
  }
}

/** Sabit zamanlı karşılaştırma — uzunluk farkı da sızdırılmaz. */
function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a, "utf8").digest();
  const hb = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(ha, hb);
}

export async function POST(request: Request) {
  const ip = getClientIp(request) ?? "bilinmiyor";

  const rate = checkRate(ip);
  if (!rate.allowed) {
    console.warn(`[admin-login] ${ip} kilitli — ${rate.retryAfterSec}s kaldı`);
    return NextResponse.json(
      { error: "Çok fazla hatalı deneme yapıldı. Bir süre sonra tekrar deneyin." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec ?? 900) } }
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password;
  } catch {
    /* gövde okunamadı — aşağıda başarısız sayılacak */
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("[admin-login] ADMIN_PASSWORD tanımlı değil — giriş kapalı.");
    return NextResponse.json({ error: "Yönetici girişi yapılandırılmamış." }, { status: 500 });
  }

  if (!password || !safeEqual(password, expected)) {
    recordFailure(ip);
    // Deneme hızını sınırlamak için sabit gecikme.
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
    console.warn(`[admin-login] hatalı şifre denemesi — ${ip}`);
    return NextResponse.json({ error: "Şifre hatalı" }, { status: 401 });
  }

  attempts.delete(ip);

  let token: string;
  try {
    token = await createAdminToken();
  } catch (err) {
    console.error("[admin-login] oturum jetonu üretilemedi:", err);
    return NextResponse.json(
      { error: "Oturum başlatılamadı. Sunucu yapılandırması eksik." },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  });
  return res;
}
