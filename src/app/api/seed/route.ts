import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { featuredProducts, navCategories } from "@/lib/data";

export async function POST() {
  try {
    const sb = createServerClient();

    // 1) Kategorileri upsert et
    const catRows = navCategories.map((c, i) => ({
      name: c.name,
      slug: c.slug,
      display_order: i + 1,
      mega_menu: c.megaMenu ?? [],
    }));

    const { error: catErr } = await sb
      .from("categories")
      .upsert(catRows, { onConflict: "slug" });

    if (catErr) {
      // display_order sütunu yoksa sütun olmadan tekrar dene
      if (catErr.message?.includes("display_order")) {
        const catRowsMin = navCategories.map((c) => ({
          name: c.name,
          slug: c.slug,
          mega_menu: c.megaMenu ?? [],
        }));
        const { error: catErr2 } = await sb
          .from("categories")
          .upsert(catRowsMin, { onConflict: "slug" });
        if (catErr2) throw new Error("Kategori hatası: " + catErr2.message);
      } else {
        throw new Error("Kategori hatası: " + catErr.message);
      }
    }

    // 2) Önce sub_category sütunlarının var olup olmadığını kontrol et
    const { error: colCheckErr } = await sb
      .from("products")
      .select("sub_category_name")
      .limit(1);

    const hasSubCat = !colCheckErr;

    // 3) Ürünleri upsert et
    const productRows = featuredProducts.map((p) => {
      const base = {
        name: p.name,
        slug: p.slug,
        description: p.description ?? "",
        price: p.price,
        sale_price: p.salePrice ?? null,
        category_name: p.category,
        category_slug: p.categorySlug,
        images: p.images ?? [],
        stock: p.stock ?? 10,
        is_active: p.isActive !== false,
        is_new: p.isNew ?? false,
        is_bestseller: p.isBestseller ?? false,
      };
      if (hasSubCat) {
        return { ...base, sub_category_name: "", sub_category_slug: "" };
      }
      return base;
    });

    const { data: inserted, error: prodErr } = await sb
      .from("products")
      .upsert(productRows, { onConflict: "slug" })
      .select();

    if (prodErr) throw new Error("Ürün hatası: " + prodErr.message);

    return NextResponse.json({
      ok: true,
      products: inserted?.length ?? 0,
      categories: catRows.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
