import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getSessionUserId } from "@/lib/auth";
import { addressSchema } from "@/lib/schemas/auth";

function mapAddress(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    city: row.city,
    district: row.district,
    fullAddress: row.full_address,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const sb = createServerClient();
  const { data, error } = await sb
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[addresses/GET] DB error:", error);
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json((data ?? []).map(mapAddress));
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const { title, recipientName, recipientPhone, city, district, fullAddress, isDefault } = parsed.data;
    const sb = createServerClient();

    // Bu adres varsayılan yapılıyorsa diğerlerinin varsayılan işaretini kaldır
    if (isDefault) {
      await sb.from("addresses").update({ is_default: false }).eq("user_id", userId);
    }

    const { data, error } = await sb
      .from("addresses")
      .insert({
        user_id: userId,
        title,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        city,
        district,
        full_address: fullAddress,
        is_default: isDefault ?? false,
      })
      .select("*")
      .single();

    if (error || !data) {
      console.error("[addresses/POST] DB error:", error);
      return NextResponse.json({ error: "Adres eklenemedi." }, { status: 500 });
    }

    return NextResponse.json(mapAddress(data), { status: 201 });
  } catch (err) {
    console.error("[addresses/POST] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik bir hata oluştu." }, { status: 500 });
  }
}
