import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();
    if (!code) return NextResponse.json({ error: "Kupon kodu giriniz." }, { status: 400 });

    const sb = createServerClient();
    const { data, error } = await sb
      .from("coupons")
      .select("*")
      .eq("code", String(code).toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Kupon kodu geçersiz veya aktif değil." }, { status: 404 });
    }

    // Son kullanma tarihi kontrolü
    if (data.expiry && new Date(data.expiry) < new Date()) {
      return NextResponse.json({ error: "Bu kuponun son kullanma tarihi geçmiş." }, { status: 400 });
    }

    // Minimum sipariş tutarı kontrolü
    if (data.min_order && Number(cartTotal) < Number(data.min_order)) {
      return NextResponse.json({
        error: `Bu kupon için minimum sipariş tutarı ₺${Number(data.min_order).toLocaleString("tr-TR")}.`,
      }, { status: 400 });
    }

    // İndirim tutarını hesapla
    const discount =
      data.type === "percent"
        ? Math.round((Number(cartTotal) * Number(data.value)) / 100 * 100) / 100
        : Number(data.value);

    // Kullanım sayısını artır
    await sb.from("coupons").update({ used_count: (data.used_count ?? 0) + 1 }).eq("id", data.id);

    return NextResponse.json({
      code: data.code,
      type: data.type,
      value: Number(data.value),
      discount,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
