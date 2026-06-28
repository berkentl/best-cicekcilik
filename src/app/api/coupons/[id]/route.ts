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
  };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sb = createServerClient();
    const { data, error } = await sb
      .from("coupons")
      .update({
        code: String(body.code).toUpperCase().trim(),
        type: body.type,
        value: Number(body.value),
        min_order: Number(body.minOrder ?? 0),
        expiry: body.expiry || null,
        is_active: body.isActive ?? true,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(mapCoupon(data));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = createServerClient();
    const { error } = await sb.from("coupons").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
