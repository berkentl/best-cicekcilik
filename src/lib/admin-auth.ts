import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!process.env.ADMIN_PASSWORD || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }
  return null;
}
