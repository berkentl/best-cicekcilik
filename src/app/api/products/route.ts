import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");
  const activeOnly = searchParams.get("active") !== "false";

  try {
    const sb = createServerClient();
    const adminList = searchParams.get("list") === "1";
    let query = adminList
      ? sb.from("products").select("id,name,slug,price,sale_price,images,category_name,category_slug,is_active,is_new,is_bestseller,stock,sales_count").order("created_at", { ascending: false })
      : sb.from("products").select("*, product_variants(*)").order("created_at", { ascending: false });

    if (activeOnly) query = query.eq("is_active", true);
    if (categorySlug && categorySlug !== "tum-urunler") {
      query = query.eq("category_slug", categorySlug);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(mapProducts(data ?? []));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();

    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json({ error: "En az bir ürün görseli eklemelisiniz." }, { status: 400 });
    }

    const sb = createServerClient();

    // Slug çakışmasını önlemek için benzersiz slug bul
    const baseSlug = (body.slug as string) || "";
    let finalSlug = baseSlug;
    for (let attempt = 1; attempt <= 20; attempt++) {
      const { data: existing } = await sb
        .from("products")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();
      if (!existing) break;
      finalSlug = `${baseSlug}-${attempt}`;
    }

    const { data: product, error: prodErr } = await sb
      .from("products")
      .insert(toDbProduct({ ...body, slug: finalSlug }))
      .select()
      .single();

    if (prodErr) throw new Error(prodErr.message);

    // Insert variants if any
    const variants: Array<{ label: string; price: number; stock: number }> = body.variants ?? [];
    if (variants.length > 0) {
      const variantRows = variants.map((v) => ({
        product_id: product.id,
        label: v.label,
        price: Number(v.price),
        stock: Number(v.stock) || 0,
      }));
      const { error: varErr } = await sb.from("product_variants").insert(variantRows);
      if (varErr) {
        // Non-fatal: product saved, log variant error
        console.error("Varyant kayıt hatası:", varErr.message);
      }
    }

    return NextResponse.json(mapProduct(product));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapProduct(row: Record<string, unknown>) {
  const variants = (row.product_variants as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    price: Number(row.price),
    salePrice: row.sale_price ? Number(row.sale_price) : undefined,
    category: row.category_name,
    categorySlug: row.category_slug,
    subCategory: row.sub_category_name ?? "",
    subCategorySlug: row.sub_category_slug ?? "",
    images: (row.images as string[]) ?? [],
    stock: row.stock ?? 0,
    isActive: row.is_active ?? true,
    isNew: row.is_new ?? false,
    isBestseller: row.is_bestseller ?? false,
    isPinnedToVitrin: row.is_pinned_to_vitrin ?? false,
    salesCount: Number(row.sales_count ?? 0),
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    careInstructions: row.care_instructions ?? "",
    extraCategorySlugs: (row.extra_category_slugs as { categorySlug: string; subCategorySlug?: string }[]) ?? [],
    variants: variants.map((v) => ({
      id: v.id,
      label: v.label,
      price: Number(v.price),
      stock: Number(v.stock) || 0,
      isActive: v.is_active ?? true,
    })),
  };
}

function mapProducts(rows: Record<string, unknown>[]) {
  return rows.map(mapProduct);
}

function toDbProduct(body: Record<string, unknown>) {
  return {
    name: body.name,
    slug: body.slug,
    description: body.description ?? "",
    price: body.price,
    sale_price: body.salePrice || null,
    category_id: body.categoryId || null,
    category_name: body.categoryName ?? body.category ?? "",
    category_slug: body.categorySlug ?? "",
    sub_category_name: body.subCategoryName ?? body.subCategory ?? "",
    sub_category_slug: body.subCategorySlug ?? "",
    images: body.images ?? [],
    stock: body.stock ?? 0,
    is_active: body.isActive ?? true,
    is_new: body.isNew ?? false,
    is_bestseller: body.isBestseller ?? false,
    is_pinned_to_vitrin: body.isPinnedToVitrin ?? false,
    seo_title: body.seoTitle ?? "",
    seo_description: body.seoDescription ?? "",
    care_instructions: body.careInstructions ?? "",
    extra_category_slugs: body.extraCategorySlugs ?? [],
  };
}
