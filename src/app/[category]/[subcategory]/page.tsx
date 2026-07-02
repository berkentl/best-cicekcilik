import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { CategoryLayout } from "@/components/CategoryLayout";
import { createServerClient } from "@/lib/supabase-server";
import { getCategories } from "@/lib/getCategories";
import { buildFilterCategories } from "@/lib/filterService";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>;
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

async function getProducts(categorySlug: string, subSlug: string): Promise<Product[]> {
  try {
    const sb = createServerClient();
    const { data, error } = await sb
      .from("products")
      .select("*")
      .eq("is_active", true)
      .or(`sub_category_slug.eq.${subSlug},extra_category_slugs.cs.[{"subCategorySlug":"${subSlug}"}]`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const all = (data ?? []).map(mapRow);
    return all.length > 0 ? all : (await sb.from("products").select("*").eq("is_active", true).eq("category_slug", categorySlug).order("created_at", { ascending: false })).data?.map(mapRow) ?? [];
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const categories = await getCategories();
  const pairs: { category: string; subcategory: string }[] = [];
  for (const cat of categories) {
    if (cat.megaMenu) {
      for (const col of cat.megaMenu) {
        for (const item of col.items) {
          pairs.push({ category: cat.slug, subcategory: item.slug });
        }
      }
    }
  }
  return pairs;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: catSlug, subcategory: subSlug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === catSlug);
  const subName = category?.megaMenu
    ?.flatMap((col) => col.items)
    .find((i) => i.slug === subSlug)?.name;
  if (!category) return { title: "Kategori Bulunamadı" };
  return {
    title: `${subName ?? subSlug} | ${category.name} | Best Çiçekçilik`,
    description: `Best Çiçekçilik ${subName ?? subSlug} ürünleri. İstanbul'a aynı gün teslimat.`,
  };
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { category: catSlug, subcategory: subSlug } = await params;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(catSlug, subSlug),
  ]);

  const category = categories.find((c) => c.slug === catSlug);
  if (!category) notFound();

  const subItem = category.megaMenu?.flatMap((col) => col.items).find((i) => i.slug === subSlug);

  const activeProducts = products.filter((p) => p.isActive !== false);

  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main>
        {/* Başlık */}
        <div className="bg-[#f5f0eb] py-10 md:py-14 text-center border-b border-[#e8e8e8]">
          <div className="container-site">
            <nav className="flex items-center justify-center gap-2 text-[12px] text-[#999] mb-4">
              <Link href="/" className="hover:text-[#1d3435] transition-colors">Ana Sayfa</Link>
              <span>/</span>
              <Link href={`/${catSlug}`} className="hover:text-[#1d3435] transition-colors">
                {category.name}
              </Link>
              <span>/</span>
              <span className="text-[#1d3435] font-medium">{subItem?.name ?? subSlug}</span>
            </nav>
            <h1 className="font-heading text-3xl md:text-4xl text-[#1d3435] font-medium">
              {subItem?.name ?? subSlug}
            </h1>
            <p className="text-[#999] text-sm mt-2">{activeProducts.length} ürün</p>
          </div>
        </div>

        {/* Ürün grid — CategoryLayout ile */}
        <CategoryLayout
          products={activeProducts}
          filterCategories={buildFilterCategories(activeProducts)}
        />
      </main>
      <Footer />
    </>
  );
}
