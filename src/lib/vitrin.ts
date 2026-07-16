import { createServerClient } from "@/lib/supabase-server";
import type { Product } from "@/types";

const VITRIN_LIMIT = 8;

/**
 * Hibrit vitrin algoritması:
 * 1. isPinnedToVitrin=true olan ürünleri öncelikli getirir (max 8)
 * 2. Boş slot varsa en yüksek salesCount'lu aktif ürünlerle tamamlar
 */
export async function getVitrinProducts(): Promise<Product[]> {
  try {
    const sb = createServerClient();

    // Sabitlenen ürünler — is_active/stok filtresi yok (stoksuz/pasif ürün
    // de "Stok Yok" rozetiyle vitrinde kalmaya devam eder)
    const { data: pinned, error: pinnedErr } = await sb
      .from("products")
      .select("*, product_variants(*)")
      .eq("is_pinned_to_vitrin", true)
      .order("sales_count", { ascending: false })
      .limit(VITRIN_LIMIT);

    if (pinnedErr) throw pinnedErr;

    const pinnedProducts = (pinned ?? []).map(mapRow);
    const remaining = VITRIN_LIMIT - pinnedProducts.length;

    if (remaining <= 0) return pinnedProducts;

    // Kalan slotları en çok satanlarla doldur
    const pinnedIds = pinnedProducts.map((p) => p.id);

    let topQuery = sb
      .from("products")
      .select("*, product_variants(*)")
      .eq("is_pinned_to_vitrin", false)
      .order("sales_count", { ascending: false })
      .limit(remaining);

    // Supabase'de "not in" için filter kullanıyoruz
    if (pinnedIds.length > 0) {
      topQuery = topQuery.not("id", "in", `(${pinnedIds.join(",")})`);
    }

    const { data: topSellers, error: topErr } = await topQuery;
    if (topErr) throw topErr;

    return [...pinnedProducts, ...(topSellers ?? []).map(mapRow)];
  } catch {
    return [];
  }
}

function mapRow(row: Record<string, unknown>): Product {
  const variants = (row.product_variants as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    price: Number(row.price),
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    category: String(row.category_name ?? ""),
    categorySlug: String(row.category_slug ?? ""),
    subCategory: String(row.sub_category_name ?? ""),
    subCategorySlug: String(row.sub_category_slug ?? ""),
    images: (row.images as string[]) ?? [],
    stock: Number(row.stock ?? 0),
    isActive: Boolean(row.is_active ?? true),
    isNew: Boolean(row.is_new ?? false),
    isBestseller: Boolean(row.is_bestseller ?? false),
    isPinnedToVitrin: Boolean(row.is_pinned_to_vitrin ?? false),
    salesCount: Number(row.sales_count ?? 0),
    seoTitle: String(row.seo_title ?? ""),
    seoDescription: String(row.seo_description ?? ""),
    variants: variants.map((v) => ({
      id: String(v.id),
      label: String(v.label),
      price: Number(v.price),
      stock: Number(v.stock) || 0,
      isActive: Boolean(v.is_active ?? true),
    })),
  };
}
