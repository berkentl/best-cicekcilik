import { NextResponse, after } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createNotification } from "@/lib/notifications";
import { sendPushToAdmins } from "@/lib/push";

/**
 * Herkese açık uç nokta — kimlik doğrulaması yerine tahmin edilemez
 * approval_token bilgisi kullanılır (Faz 1'de üretilen UUID). Müşteri
 * link üzerinden geldiği için admin oturumu gerektirmez.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  const action = body?.action;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  const isAuto = body?.auto === true;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  }
  if (action === "reject" && !reason) {
    return NextResponse.json({ error: "Lütfen revize sebebini belirtin." }, { status: 400 });
  }

  const sb = createServerClient();

  const { data: order, error: fetchError } = await sb
    .from("orders")
    .select("id, order_number, customer_name, approval_status")
    .eq("approval_token", token)
    .maybeSingle();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  // Zaten sonuçlanmışsa (çift tıklama / sayfa yenileme) tekrar işlemeden mevcut durumu döndür
  if (order.approval_status === "APPROVED" || order.approval_status === "REJECTED") {
    return NextResponse.json({
      approvalStatus: order.approval_status,
      alreadyProcessed: true,
    });
  }

  const updates =
    action === "approve"
      ? { approval_status: "APPROVED", rejection_reason: null }
      : { approval_status: "REJECTED", rejection_reason: reason };

  const { error: updateError } = await sb
    .from("orders")
    .update(updates)
    .eq("id", order.id);

  if (updateError) {
    console.error("[approve-by-token] DB güncelleme hatası:", updateError);
    return NextResponse.json({ error: "İşlem gerçekleştirilemedi." }, { status: 500 });
  }

  // Admin paneline bildirim + (varsa) push — yanıtı bekletmeden arka planda
  // gönderilir (bkz. orders/create/route.ts'teki after() açıklaması).
  const customerLabel = order.customer_name || "Müşteri";
  if (action === "approve") {
    const title = isAuto ? "⏱️ Süre Doldu — Otomatik Onaylandı" : "✅ Müşteri Siparişi Onayladı";
    const message = isAuto
      ? `${customerLabel} — #${order.order_number} için 15 dakikalık onay süresi doldu, sipariş otomatik onaylandı.`
      : `${customerLabel} — #${order.order_number} siparişindeki çiçek görselini onayladı.`;
    after(async () => {
      await Promise.allSettled([
        createNotification({
          type: "order_approved",
          title,
          message,
          data: { orderId: order.id, orderNumber: order.order_number, auto: isAuto },
        }),
        sendPushToAdmins({ title, body: message, url: "/admin/siparisler", tag: `approval-${order.id}` }),
      ]);
    });
  } else {
    const title = "🔁 Revize Talebi Alındı";
    const message = `${customerLabel} — #${order.order_number} için revize istedi: "${reason}"`;
    after(async () => {
      await Promise.allSettled([
        createNotification({
          type: "order_rejected",
          title,
          message,
          data: { orderId: order.id, orderNumber: order.order_number, reason },
        }),
        sendPushToAdmins({ title, body: message, url: "/admin/siparisler", tag: `approval-${order.id}` }),
      ]);
    });
  }

  return NextResponse.json({ approvalStatus: updates.approval_status });
}
