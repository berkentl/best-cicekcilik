import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const authed = Boolean(process.env.ADMIN_PASSWORD && session === process.env.ADMIN_PASSWORD);
  return NextResponse.json({ authed });
}
