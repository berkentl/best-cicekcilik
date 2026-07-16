import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";
import { sendSMS } from "@/lib/netgsm";

const APPROVAL_WINDOW_MINUTES = 15;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const approvalImageUrl = body?.approvalImageUrl;

  if (!approvalImageUrl || typeof approvalImageUrl !== "string") {
    return NextResponse.json({ error: "approvalImageUrl zorunludur." }, { status: 400 });
  }

  const sb = createServerClient();

  const { data: order, error: fetchError } = await sb
    .from("orders")
    .select("id, customer_phone")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  const approvalToken = randomUUID();
  const approvalExpiresAt = new Date(
    Date.now() + APPROVAL_WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  const { data: updated, error: updateError } = await sb
    .from("orders")
    .update({
      approval_image_url: approvalImageUrl,
      approval_token: approvalToken,
      approval_expires_at: approvalExpiresAt,
      approval_status: "PENDING",
      rejection_reason: null,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("[request-approval] DB güncelleme hatası:", updateError);
    return NextResponse.json({ error: "Onay talebi kaydedilemedi." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;

  let smsSent = false;
  let smsError: string | undefined;
  if (order.customer_phone) {
    const message =
      `Dünyanın Çiçeği siparişiniz yola çıkmaya hazırdır. Çiçeğinizi görmek ve onaylamak için ` +
      `15 dakikanız bulunmaktadır: ${origin}/onay/${approvalToken}`;
    const result = await sendSMS(order.customer_phone, message);
    smsSent = result.success;
    smsError = result.error;
  } else {
    smsError = "Siparişte kayıtlı bir telefon numarası bulunamadı.";
  }

  return NextResponse.json({
    approvalToken,
    approvalExpiresAt,
    approvalStatus: "PENDING",
    smsSent,
    ...(smsError ? { smsError } : {}),
    order: updated,
  });
}
