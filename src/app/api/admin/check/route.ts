import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-session";

/**
 * Yönetici oturumunun geçerli olup olmadığını söyler.
 *
 * Şifre karşılaştırması yerine imza doğrulaması yapılıyor. Önceden bu uç de
 * çerez değerini doğrudan ADMIN_PASSWORD ile karşılaştırıyordu; jetona
 * geçildiği için buranın da güncellenmesi zorunluydu, aksi hâlde geçerli
 * oturumu olan yönetici "oturum yok" olarak görünürdü.
 */
export async function GET() {
  const cookieStore = await cookies();
  const authed = await verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
  return NextResponse.json({ authed });
}
