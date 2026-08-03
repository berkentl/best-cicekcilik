import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-session";

/**
 * Yönetici yetkisini doğrular. Yetki yoksa 401 yanıtı, varsa null döner.
 *
 * Çerez artık şifreyi değil SESSION_SECRET ile imzalanmış, süresi olan bir
 * jetonu taşıyor (bkz. lib/admin-session.ts). Jetonun `purpose: "admin"`
 * olması ayrıca kontrol edilir — müşteri oturum jetonu aynı anahtarla
 * imzalandığı için bu kontrol olmadan sıradan bir müşteri yönetici
 * olabilirdi.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const ok = await verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!ok) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  return null;
}
