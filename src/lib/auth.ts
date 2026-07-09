import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { createServerClient } from "@/lib/supabase-server";
import type { CustomerUser } from "@/types";

export const SESSION_COOKIE = "customer_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 gün
const RESET_TOKEN_MAX_AGE_SEC = 60 * 60; // 1 saat

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.warn(
      "[auth] SESSION_SECRET tanımlı değil — geçici, güvensiz bir anahtar kullanılıyor. .env.local'e SESSION_SECRET ekleyin."
    );
  }
  return new TextEncoder().encode(secret || "dev-insecure-secret-change-me");
}

// ─── Şifre hash'leme ──────────────────────────────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── Oturum token'ı (JWT, httpOnly cookie) ───────────────────────────────────

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, purpose: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.purpose !== "session" || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

/** Login/register API'lerinde çağrılır — httpOnly session cookie'sini set eder. */
export async function setSessionCookie(userId: string) {
  const token = await createSessionToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Sunucu bileşenleri ve API route'ları için: geçerli oturumun user id'si. */
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Geçerli oturumun tam kullanıcı kaydını döner (şifre hash'i hariç). Yoksa null. */
export async function getCurrentUser(): Promise<CustomerUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const sb = createServerClient();
  const { data, error } = await sb
    .from("users")
    .select("id, email, name, phone, kvkk_consent, marketing_consent, created_at")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name ?? "",
    phone: data.phone ?? "",
    kvkkConsent: data.kvkk_consent ?? false,
    marketingConsent: data.marketing_consent ?? false,
    createdAt: data.created_at,
  };
}

// ─── Şifre sıfırlama token'ı (stateless — DB'de tutulmaz) ────────────────────

export async function createResetToken(email: string): Promise<string> {
  return new SignJWT({ email, purpose: "reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${RESET_TOKEN_MAX_AGE_SEC}s`)
    .sign(getSecretKey());
}

export async function verifyResetToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.purpose !== "reset" || typeof payload.email !== "string") return null;
    return payload.email;
  } catch {
    return null;
  }
}
