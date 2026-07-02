import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "1";

  const sb = createServerClient();
  let query = sb
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (unreadOnly) query = query.eq("is_read", false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await request.json() as { ids?: string[]; all?: boolean };
  const sb = createServerClient();

  if (body.all) {
    await sb.from("notifications").update({ is_read: true }).eq("is_read", false);
  } else if (body.ids?.length) {
    await sb.from("notifications").update({ is_read: true }).in("id", body.ids);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const sb = createServerClient();
  await sb.from("notifications").delete().eq("is_read", true);
  return NextResponse.json({ ok: true });
}
