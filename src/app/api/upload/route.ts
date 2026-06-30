import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import sharp from "sharp";

// Maksimum çıktı boyutları — bu değerlerin üzerindeki fotoğraflar küçültülür
const MAX_WIDTH  = 1400;
const MAX_HEIGHT = 1400;
const WEBP_QUALITY = 82; // 0-100, 82 gözle fark edilmez kayıpla ~200-400 KB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Dosyayı Buffer'a çevir
    const buffer = Buffer.from(await file.arrayBuffer());

    // sharp ile yeniden boyutlandır + WebP'ye dönüştür
    const optimized = await sharp(buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: "inside",        // en-boy oranını korur, büyütmez
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

    const sb = createServerClient();
    const { error } = await sb.storage
      .from("product-images")
      .upload(fileName, optimized, { contentType: "image/webp", upsert: false });

    if (error) throw error;

    const { data } = sb.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
