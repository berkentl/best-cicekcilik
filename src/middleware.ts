import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_API_PATTERNS = [
  /^\/api\/admin\//,
  /^\/api\/upload$/,
  /^\/api\/coupons/,
  /^\/api\/orders\/recent$/,
];

const METHOD_PROTECTED: Array<{ path: string; methods: string[] }> = [
  { path: "/api/site-settings", methods: ["PUT", "PATCH", "DELETE"] },
  { path: "/api/products", methods: ["POST", "PUT", "PATCH", "DELETE"] },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const isAdminApi = ADMIN_API_PATTERNS.some((re) => re.test(pathname));
  const isMethodProtected = METHOD_PROTECTED.some(
    (rule) => pathname === rule.path && rule.methods.includes(method)
  );

  if (!isAdminApi && !isMethodProtected) return NextResponse.next();

  const session = request.cookies.get("admin_session")?.value;
  const password = process.env.ADMIN_PASSWORD;

  if (!password || session !== password) {
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
    "/api/site-settings",
    "/api/products",
  ],
};
