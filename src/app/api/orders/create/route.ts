import { NextResponse, after } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateOrderNumber } from "@/lib/order-utils";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendPushToAdmins } from "@/lib/push";
import { createNotification } from "@/lib/notifications";
import { getSessionUserId } from "@/lib/auth";
import { DELIVERABLE_PROVINCE } from "@/lib/turkishProvinces";
import { createKolaysoftInvoice, mapOrderToKolaysoftInvoice } from "@/lib/kolaysoft";

interface OrderItem {
  productId?: string;
  name: string;
  qty: number;
  price: number;
}

async function decreaseStock(sb: ReturnType<typeof createServerClient>, items: OrderItem[]) {
  const itemsWithId = items.filter((i) => i.productId);
  if (!itemsWithId.length) return;

  const ids = itemsWithId.map((i) => i.productId!);
  const { data: products } = await sb
    .from("products")
    .select("id, name, stock")
    .in("id", ids);

  if (!products?.length) return;

  await Promise.all(
    itemsWithId.map(async (item) => {
      const current = products.find((p) => p.id === item.productId);
      if (!current) return;
      const newStock = Math.max(0, (current.stock ?? 0) - item.qty);

      const updates: Record<string, unknown> = { stock: newStock };
      if (newStock === 0) updates.is_active = false;

      await sb.from("products").update(updates).eq("id", item.productId!);

      if (newStock === 0) {
        await createNotification({
          type: "out_of_stock",
          title: "Stok Tükendi",
          message: `"${current.name}" adlı ürünün stoğu tükendi ve satışa kapatıldı.`,
          data: { productId: item.productId, productName: current.name },
        });
      }
    })
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { form, items, total, discount, couponCode, grandTotal, kapidaFee } = body;

    if (!form || !items?.length) {
      return NextResponse.json({ error: "Geçersiz sipariş verisi." }, { status: 400 });
    }

    if (form.city !== DELIVERABLE_PROVINCE) {
      return NextResponse.json(
        { error: `Şu anda yalnızca ${DELIVERABLE_PROVINCE} içine teslimat yapabiliyoruz.` },
        { status: 400 }
      );
    }

    const sb = createServerClient();
    const orderNumber = generateOrderNumber();
    const customerName = `${form.firstName} ${form.lastName}`.trim();
    const productName = items.map((i: { name: string; qty: number }) => `${i.name} (×${i.qty})`).join(", ");
    const userId = await getSessionUserId();

    // DB'ye kaydet
    const { data: order, error } = await sb.from("orders").insert({
      order_number: orderNumber,
      user_id: userId ?? null,
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

    // Stok azaltma, bildirim, push ve e-posta — yanıtı bekletmeden arka planda
    // çalışır. Vercel'in serverless ortamında yanıt döndükten sonra fonksiyon
    // donabildiği için bunlar after() ile isteğin ömrüne bağlanıyor, yoksa
    // gönderim bir sonraki isteğe kadar askıda kalıp dakikalarca gecikebiliyor.
    after(async () => {
      await Promise.allSettled([
        decreaseStock(sb, items as OrderItem[]).catch((err) =>
          console.error("[create-order] stock decrease failed:", err)
        ),
        createNotification({
          type: "new_order",
          title: "Yeni Sipariş",
          message: `${customerName} tarafından ₺${grandTotal.toLocaleString("tr-TR")} tutarında yeni sipariş oluşturuldu.`,
          data: { orderId: order.id, orderNumber, customerName, total: grandTotal },
        }).catch((err) => console.error("[create-order] notification failed:", err)),
        sendPushToAdmins({
          title: "🌸 Yeni Sipariş!",
          body: `${customerName} — ₺${grandTotal.toLocaleString("tr-TR")}`,
          url: "/admin/siparisler",
          tag: "new-order",
        }).catch((err) => console.error("[push] send failed:", err)),
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
          siteUrl: new URL(request.url).origin,
        }).catch((err) => console.error("[email] send failed:", err)),
        // e-Arşiv fatura — Kolaysoft'un gerçek API dokümantasyonu teyit
        // edilmeden canlıda güvenilir çalışacağı garanti edilemez, bkz.
        // src/lib/kolaysoft.ts başındaki not. Hata sipariş akışını durdurmaz.
        createKolaysoftInvoice(
          mapOrderToKolaysoftInvoice({
            orderNumber,
            customerName,
            customerEmail: form.email,
            customerPhone: form.phone,
            address: form.address,
            city: form.city,
            district: form.district,
            items,
          })
        ).then((result) => {
          if (!result.success) {
            console.error("[kolaysoft] fatura oluşturulamadı:", result.error);
          } else {
            console.log(`[kolaysoft] fatura oluşturuldu: ${result.invoiceNumber ?? result.ettn}`);
          }
        }).catch((err) => console.error("[kolaysoft] beklenmedik hata:", err)),
      ]);
    });

    return NextResponse.json({ orderNumber, id: order.id }, { status: 201 });
  } catch (err) {
    console.error("[create-order] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik hata." }, { status: 500 });
  }
}
