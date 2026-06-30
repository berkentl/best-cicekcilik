import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/orders] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
