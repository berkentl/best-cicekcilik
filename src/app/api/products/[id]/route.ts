import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

function mapProduct(row: Record<string, unknown>) {
  const variants =
    (row.product_variants as Array<Record<string, unknown>> | undefined) ?? [];
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
    stock: Number(row.stock ?? 0),
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

function toDbProduct(body: Record<string, unknown>) {
  return {
    name: body.name,
    slug: body.slug,
    description: body.description ?? "",
    price: body.price,
    sale_price: body.salePrice ?? null,
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = createServerClient();
    const { data, error } = await sb
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json(mapProduct(data));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json({ error: "En az bir ürün görseli eklemelisiniz." }, { status: 400 });
    }

    const sb = createServerClient();

    const { data, error } = await sb
      .from("products")
      .update(toDbProduct(body))
      .eq("id", id)
      .select("*, product_variants(*)")
      .single();

    if (error) throw new Error(error.message);

    // Varyant güncellemesi (varsa)
    const variants: Array<{ id?: string; label: string; price: number; stock: number }> =
      body.variants ?? [];
    if (variants.length > 0) {
      // Mevcut varyantları sil, yeniden ekle
      await sb.from("product_variants").delete().eq("product_id", id);
      const variantRows = variants.map((v) => ({
        product_id: id,
        label: v.label,
        price: Number(v.price),
        stock: Number(v.stock) || 0,
      }));
      const { error: varErr } = await sb.from("product_variants").insert(variantRows);
      if (varErr) console.error("Varyant güncelleme hatası:", varErr.message);
    }

    return NextResponse.json(mapProduct(data));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = createServerClient();
    const { error } = await sb.from("products").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
