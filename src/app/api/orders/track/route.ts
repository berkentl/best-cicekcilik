import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, email } = body as { orderNumber: string; email: string };

    if (!orderNumber?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Sipariş numarası ve e-posta adresi zorunludur." },
        { status: 400 }
      );
    }

    const sb = createServerClient();

    const { data: order, error } = await sb
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber.trim().toUpperCase())
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      console.error("[track-order] DB error:", error);
      return NextResponse.json(
        { error: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Girdiğiniz bilgilere ait sipariş bulunamadı. Lütfen bilgilerinizi kontrol ediniz." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderNumber: order.order_number,
      product: order.product_name,
      date: new Date(order.created_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      estimatedDelivery: order.estimated_delivery ?? "Belirtilmedi",
      currentStep: order.tracking_step ?? 0,
      status: order.status ?? "Yeni",
      courier: order.courier_name ?? null,
      courierPhone: order.courier_phone ?? null,
      trackingNumber: order.tracking_number ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek formatı." },
      { status: 400 }
    );
  }
}
