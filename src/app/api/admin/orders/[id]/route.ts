import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, tracking_number, tracking_step, courier_name, courier_phone } = body;

  const STATUS_TO_STEP: Record<string, number> = {
    "Yeni": 0,
    "Hazırlanıyor": 1,
    "Kargoya Verildi": 2,
    "Teslim Edildi": 3,
    "İptal": 0,
    "İade": 0,
  };

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status !== undefined) {
    updates.status = status;
    updates.tracking_step = STATUS_TO_STEP[status] ?? 0;
  }
  if (tracking_number !== undefined) updates.tracking_number = tracking_number;
  if (tracking_step !== undefined) updates.tracking_step = tracking_step;
  if (courier_name !== undefined) updates.courier_name = courier_name;
  if (courier_phone !== undefined) updates.courier_phone = courier_phone;

  const sb = createServerClient();
  const { data, error } = await sb
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/orders/patch] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
