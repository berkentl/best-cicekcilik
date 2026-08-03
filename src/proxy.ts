import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-session";

const PUBLIC_ADMIN_ROUTES = [
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/check",
];

const ADMIN_API_PATTERNS = [
  /^\/api\/admin\//,
  /^\/api\/upload$/,
  /^\/api\/coupons/,
  /^\/api\/orders\/recent$/,
  // Push abonelikleri yalnızca yönetici cihazlarına ait; sendPushToAdmins
  // bu tablodaki tüm kayıtlara müşteri adı ve tutar içeren bildirim
  // gönderiyor. Uç ayrıca kendi içinde de requireAdmin() çağırıyor —
  // burada olması ikinci katman.
  /^\/api\/push\//,
];

const METHOD_PROTECTED: Array<{ path: string; methods: string[] }> = [
  { path: "/api/site-settings", methods: ["PUT", "PATCH", "DELETE"] },
  { path: "/api/products", methods: ["POST", "PUT", "PATCH", "DELETE"] },
  { path: "/api/cross-sell", methods: ["PUT", "PATCH", "DELETE"] },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (PUBLIC_ADMIN_ROUTES.includes(pathname)) return NextResponse.next();

  const isAdminApi = ADMIN_API_PATTERNS.some((re) => re.test(pathname));
  const isMethodProtected = METHOD_PROTECTED.some(
    (rule) => pathname === rule.path && rule.methods.includes(method)
  );

  if (!isAdminApi && !isMethodProtected) return NextResponse.next();

  /*
    Çerez artık ADMIN_PASSWORD'ün kendisi değil, SESSION_SECRET ile
    imzalanmış süreli bir jeton. Karşılaştırma yerine imza doğrulaması
    yapılıyor — bkz. lib/admin-session.ts.
  */
  const ok = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!ok) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/upload",
    "/api/coupons/:path*",
    "/api/orders/recent",
    "/api/push/:path*",
    "/api/site-settings",
    "/api/products",
    "/api/cross-sell",
  ],
};
