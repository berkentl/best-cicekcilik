import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

function mapCoupon(row: Record<string, unknown>) {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value),
    minOrder: Number(row.min_order ?? 0),
    expiry: row.expiry ?? null,
    usedCount: Number(row.used_count ?? 0),
    isActive: Boolean(row.is_active ?? true),
    createdAt: row.created_at,
  };
}

export async function GET() {
  try {
    const sb = createServerClient();
    const { data, error } = await sb
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json((data ?? []).map(mapCoupon));
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sb = createServerClient();
    const { data, error } = await sb
      .from("coupons")
      .insert({
        code: String(body.code).toUpperCase().trim(),
        type: body.type,
        value: Number(body.value),
        min_order: Number(body.minOrder ?? 0),
        expiry: body.expiry || null,
        is_active: body.isActive ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(mapCoupon(data));
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
