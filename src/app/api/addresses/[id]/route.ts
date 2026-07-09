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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const sb = createServerClient();

    // Adresin bu kullanıcıya ait olduğunu doğrula
    const { data: existing } = await sb
      .from("addresses")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Adres bulunamadı." }, { status: 404 });
    }

    const { title, recipientName, recipientPhone, city, district, fullAddress, isDefault } = parsed.data;

    if (isDefault) {
      await sb.from("addresses").update({ is_default: false }).eq("user_id", userId);
    }

    const { data, error } = await sb
      .from("addresses")
      .update({
        title,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        city,
        district,
        full_address: fullAddress,
        is_default: isDefault ?? false,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[addresses/PATCH] DB error:", error);
      return NextResponse.json({ error: "Adres güncellenemedi." }, { status: 500 });
    }

    return NextResponse.json(mapAddress(data));
  } catch (err) {
    console.error("[addresses/PATCH] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik bir hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const { id } = await params;
  const sb = createServerClient();

  const { error } = await sb
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[addresses/DELETE] DB error:", error);
    return NextResponse.json({ error: "Adres silinemedi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
