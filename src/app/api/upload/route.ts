import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const sb = createServerClient();
    const { error } = await sb.storage
      .from("product-images")
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) throw error;

    const { data } = sb.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
