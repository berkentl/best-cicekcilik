import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

interface CrossSellSettings {
  active: boolean;
  title: string;
  productIds: string[];
}

const DEFAULT_TITLE = "Daha Önceki Müşteriler Bunu da Beğendi";

function mapProduct(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    images: (row.images as string[]) ?? [],
    category: row.category_name,
    categorySlug: row.category_slug,
    isActive: row.is_active ?? true,
  };
}

async function readSettings(sb: ReturnType<typeof createServerClient>): Promise<CrossSellSettings> {
  const { data } = await sb
    .from("site_settings")
    .select("key, value")
    .in("key", ["cross_sell_active", "cross_sell_title", "cross_sell_product_ids"]);

  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value;

  let productIds: string[] = [];
  if (map["cross_sell_product_ids"]) {
    try {
      const parsed = JSON.parse(map["cross_sell_product_ids"]);
      if (Array.isArray(parsed)) productIds = parsed;
    } catch {
      // yoksay
    }
  }

  return {
    active: map["cross_sell_active"] === "true",
    title: map["cross_sell_title"] || DEFAULT_TITLE,
    productIds,
  };
}

export async function GET() {
  const sb = createServerClient();
  const settings = await readSettings(sb);

  if (!settings.active || settings.productIds.length === 0) {
    return NextResponse.json({ active: false, title: settings.title, products: [] });
  }

  const { data: products, error } = await sb
    .from("products")
    .select("id, name, slug, price, sale_price, images, category_name, category_slug, is_active")
    .in("id", settings.productIds)
    .eq("is_active", true);

  if (error) {
    console.error("[cross-sell/GET] DB error:", error);
    return NextResponse.json({ active: false, title: settings.title, products: [] });
  }

  // Admin'de seçilen sırayı koru
  const ordered = settings.productIds
    .map((id) => products?.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map(mapProduct);

  return NextResponse.json({
    active: ordered.length > 0,
    title: settings.title,
    products: ordered,
  });
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json() as { active: boolean; title: string; productIds: string[] };
    const sb = createServerClient();

    const { error } = await sb.from("site_settings").upsert(
      [
        { key: "cross_sell_active", value: String(Boolean(body.active)) },
        { key: "cross_sell_title", value: body.title?.trim() || DEFAULT_TITLE },
        { key: "cross_sell_product_ids", value: JSON.stringify(body.productIds ?? []) },
      ],
      { onConflict: "key" }
    );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cross-sell/PUT] error:", err);
    return NextResponse.json({ error: "Kaydedilemedi." }, { status: 500 });
  }
}
