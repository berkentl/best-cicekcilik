import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateOrderNumber } from "@/lib/order-utils";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendPushToAdmins } from "@/lib/push";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { form, items, total, discount, couponCode, grandTotal, kapidaFee } = body;

    if (!form || !items?.length) {
      return NextResponse.json({ error: "Geçersiz sipariş verisi." }, { status: 400 });
    }

    const sb = createServerClient();
    const orderNumber = generateOrderNumber();
    const customerName = `${form.firstName} ${form.lastName}`.trim();
    const productName = items.map((i: { name: string; qty: number }) => `${i.name} (×${i.qty})`).join(", ");

    // DB'ye kaydet
    const { data: order, error } = await sb.from("orders").insert({
      order_number: orderNumber,
      email: form.email.toLowerCase().trim(),
      customer_name: customerName,
      customer_phone: form.phone,
      product_name: productName,
      items: items,
      subtotal: total,
      discount_amount: discount ?? 0,
      coupon_code: couponCode ?? null,
      shipping_fee: grandTotal - (total - (discount ?? 0)) - (kapidaFee ?? 0),
      kapida_fee: kapidaFee ?? 0,
      total_amount: grandTotal,
      address: `${form.address}, ${form.district}, ${form.city}`,
      recipient_name: form.recipientName,
      recipient_phone: form.recipientPhone,
      card_message: form.cardMessage || null,
      delivery_date: form.deliveryDate,
      delivery_time: form.deliveryTime,
      payment_method: form.paymentMethod,
      notes: form.notes || null,
      tracking_step: 0,
      status: "Yeni",
      estimated_delivery: `${form.deliveryDate} ${form.deliveryTime}`,
    }).select().single();

    if (error) {
      console.error("[create-order] DB error:", error);
      return NextResponse.json({ error: "Sipariş kaydedilemedi." }, { status: 500 });
    }

    // Web Push bildirimi (hata sipariş oluşturmayı engellemez)
    sendPushToAdmins({
      title: "🌸 Yeni Sipariş!",
      body: `${customerName} — ₺${grandTotal.toLocaleString("tr-TR")}`,
      url: "/admin/siparisler",
      tag: "new-order",
    }).catch((err) => console.error("[push] send failed:", err));

    // Onay maili gönder (hata sipariş oluşturmayı engellemez)
    sendOrderConfirmationEmail({
      to: form.email,
      customerName,
      orderNumber,
      items,
      total: grandTotal,
      address: `${form.address}, ${form.district}, ${form.city}`,
      deliveryDate: form.deliveryDate,
      deliveryTime: form.deliveryTime,
      recipientName: form.recipientName,
      cardMessage: form.cardMessage,
    }).catch((err) => console.error("[email] send failed:", err));

    return NextResponse.json({ orderNumber, id: order.id }, { status: 201 });
  } catch (err) {
    console.error("[create-order] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik hata." }, { status: 500 });
  }
}
