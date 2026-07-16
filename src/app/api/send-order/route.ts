import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { sendOrderConfirmationEmail } from "@/lib/email";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const orderId = body?.orderId;

  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "orderId zorunludur." }, { status: 400 });
  }

  const sb = createServerClient();
  const { data: order, error } = await sb
    .from("orders")
    .select(
      "order_number, email, customer_name, items, total_amount, address, delivery_date, delivery_time, recipient_name, card_message"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  if (!order.email) {
    return NextResponse.json({ error: "Siparişte e-posta adresi yok." }, { status: 400 });
  }

  try {
    await sendOrderConfirmationEmail({
      to: order.email,
      customerName: order.customer_name,
      orderNumber: order.order_number,
      items: (order.items as OrderItem[]) ?? [],
      total: order.total_amount,
      address: order.address,
      deliveryDate: order.delivery_date,
      deliveryTime: order.delivery_time,
      recipientName: order.recipient_name,
      cardMessage: order.card_message ?? undefined,
      siteUrl: new URL(request.url).origin,
    });
  } catch (err) {
    console.error("[send-order] Resend gönderim hatası:", err);
    return NextResponse.json({ error: "E-posta gönderilemedi." }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
