import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  const sb = createServerClient();
  const { data } = await sb
    .from("orders")
    .select("id, order_number, customer_name, total_amount")
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ orders: data ?? [] });
}
