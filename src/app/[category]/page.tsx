import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { CategoryLayout } from "@/components/CategoryLayout";
import { createServerClient } from "@/lib/supabase-server";
import { navCategories } from "@/lib/data";
import { getCategories } from "@/lib/getCategories";
import { buildFilterCategories } from "@/lib/filterService";
import type { Product, Category } from "@/types";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ category: string }>;
}

function mapRow(row: Record<string, unknown>): Product {
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
    tags: (row.tags as string[] | null) ?? [],
  };
}

async function getProducts(categorySlug: string): Promise<Product[]> {
  try {
    const sb = createServerClient();
    if (categorySlug === "tum-urunler") {
      const { data, error } = await sb.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapRow);
    }
    // Ana kategori + ek kategorilerde bu kategoriye sahip ürünler
    const { data, error } = await sb
      .from("products")
      .select("*")
      .eq("is_active", true)
      .or(`category_slug.eq.${categorySlug},extra_category_slugs.cs.[{"categorySlug":"${categorySlug}"}]`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return navCategories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return { title: "Kategori Bulunamadı" };
  return {
    title: `${category.name} | Best Çiçekçilik`,
    description: `Best Çiçekçilik ${category.name} koleksiyonu. İstanbul'a aynı gün teslimat.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: categorySlug } = await params;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(categorySlug),
  ]);

  const category = categories.find((c) => c.slug === categorySlug)
    ?? (categorySlug === "tum-urunler" ? { id: "tum-urunler", name: "Tüm Ürünler", slug: "tum-urunler" } as const : null);
  if (!category) notFound();

  const activeProducts = products.filter((p) => p.isActive !== false);

  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main>
        <CategoryLayout
          products={activeProducts}
          filterCategories={buildFilterCategories(activeProducts)}
        />
      </main>
      <Footer />
    </>
  );
}
