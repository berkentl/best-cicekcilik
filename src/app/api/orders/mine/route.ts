import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";

type OrderItemRow = { productId?: string; name: string; qty: number; price: number; image?: string };

function mapOrder(row: Record<string, unknown>, productImages: Map<string, string>) {
  const items = ((row.items as OrderItemRow[] | null) ?? []).map((item) => ({
    ...item,
    image: item.productId ? productImages.get(item.productId) : undefined,
  }));

  return {
    id: row.id,
    orderNumber: row.order_number,
    items,
    totalAmount: Number(row.total_amount ?? 0),
    status: row.status,
    trackingStep: Number(row.tracking_step ?? 0),
    trackingNumber: row.tracking_number ?? undefined,
    courierName: row.courier_name ?? undefined,
    courierPhone: row.courier_phone ?? undefined,
    address: row.address,
    recipientName: row.recipient_name,
    deliveryDate: row.delivery_date,
    deliveryTime: row.delivery_time,
    createdAt: row.created_at,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const sb = createServerClient();

  // Hesaba bağlı (user_id) siparişler + hesap açılmadan önce aynı e-posta
  // ile verilmiş geçmiş siparişler tek listede birleştirilir.
  const { data, error } = await sb
    .from("orders")
    .select(
      "id, order_number, items, total_amount, status, tracking_step, tracking_number, courier_name, courier_phone, address, recipient_name, delivery_date, delivery_time, created_at, user_id, email"
    )
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders/mine] DB error:", error);
    return NextResponse.json([], { status: 200 });
  }

  const productIds = Array.from(
    new Set(
      (data ?? [])
        .flatMap((row) => (row.items as OrderItemRow[] | null) ?? [])
        .map((item) => item.productId)
        .filter((id): id is string => Boolean(id))
    )
  );

  const productImages = new Map<string, string>();
  if (productIds.length > 0) {
    const { data: products } = await sb
      .from("products")
      .select("id, images")
      .in("id", productIds);
    for (const p of products ?? []) {
      const images = (p.images as string[] | null) ?? [];
      if (images[0]) productImages.set(p.id, images[0]);
    }
  }

  return NextResponse.json((data ?? []).map((row) => mapOrder(row, productImages)));
}
