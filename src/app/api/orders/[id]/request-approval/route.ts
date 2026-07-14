import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

const APPROVAL_WINDOW_MINUTES = 15;
const NETGSM_SEND_URL = "https://api.netgsm.com.tr/sms/rest/v2/send";

/** NetGSM, telefon numarasını başında 0/90 olmadan 10 haneli bekler (5XXXXXXXXX). */
function toNetgsmPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) return digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);
  return digits;
}

async function sendApprovalSms(phone: string, approvalToken: string, origin: string): Promise<void> {
  const { NETGSM_USER, NETGSM_PASS, NETGSM_HEADER } = process.env;
  if (!NETGSM_USER || !NETGSM_PASS || !NETGSM_HEADER) {
    throw new Error(
      "NetGSM ortam değişkenleri eksik (NETGSM_USER / NETGSM_PASS / NETGSM_HEADER)."
    );
  }

  const message =
    `Dünyanın Çiçeği siparişiniz yola çıkmaya hazırdır. Çiçeğinizi görmek ve onaylamak için ` +
    `15 dakikanız bulunmaktadır: ${origin}/onay/${approvalToken}`;

  const auth = Buffer.from(`${NETGSM_USER}:${NETGSM_PASS}`).toString("base64");

  const res = await fetch(NETGSM_SEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      msgheader: NETGSM_HEADER,
      encoding: "TR",
      messages: [{ msg: message, no: toNetgsmPhone(phone) }],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`NetGSM SMS gönderimi başarısız (HTTP ${res.status}): ${text}`);
  }
}

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
    try {
      await sendApprovalSms(order.customer_phone, approvalToken, origin);
      smsSent = true;
    } catch (err) {
      smsError = err instanceof Error ? err.message : "SMS gönderilemedi.";
      console.error("[request-approval] SMS gönderim hatası:", err);
    }
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
