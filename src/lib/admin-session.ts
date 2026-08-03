import { SignJWT, jwtVerify } from "jose";

/**
 * Yönetici oturum jetonu.
 *
 * Neden ayrı bir dosya: bu modül `proxy.ts` (Edge çalışma zamanı) içinden de
 * çağrılıyor. `lib/auth.ts` bcrypt ve Supabase istemcisi import ettiği için
 * Edge'de çalışmaz; burada yalnızca `jose` kullanılıyor.
 *
 * Neden imzalı jeton: önceden `admin_session` çerezinin DEĞERİ doğrudan
 * ADMIN_PASSWORD'ün kendisiydi. Çerez httpOnly olduğu için tarayıcı
 * JavaScript'i okuyamıyordu, fakat çerezin ele geçtiği her durumda
 * (cihazın başkasına geçmesi, tarayıcı profilinin kopyalanması, çerez
 * okuyabilen bir eklenti, bir ara sunucu günlüğü) saldırgan yalnızca bir
 * oturumu değil ŞİFRENİN KENDİSİNİ elde ediyordu. Ayrıca şifreyi
 * değiştirmeden tek bir oturumu iptal etmek mümkün değildi.
 *
 * Artık çerez, SESSION_SECRET ile imzalanmış ve süresi olan bir jeton
 * taşıyor. Jeton şifreyi içermiyor; ele geçse bile şifre öğrenilemez ve
 * SESSION_SECRET değiştirilerek tüm oturumlar tek hamlede geçersiz kılınır.
 */

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 12; // 12 saat

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Sessizce güvensiz bir varsayılana düşmek, üretimde fark edilmeyen bir
    // açık bırakır. Yönetici oturumu bu durumda hiç kurulmamalı.
    throw new Error(
      "SESSION_SECRET tanımlı değil — yönetici oturumu imzalanamaz. Ortam değişkenini ekleyin."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ purpose: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE_SEC}s`)
    .sign(getSecretKey());
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    // `purpose` kontrolü şart: müşteri oturum jetonu da aynı anahtarla
    // imzalandığı için, bu kontrol olmadan sıradan bir müşteri kendi
    // çerezini admin_session olarak göndererek yönetici olabilirdi.
    return payload.purpose === "admin";
  } catch {
    return false;
  }
}
