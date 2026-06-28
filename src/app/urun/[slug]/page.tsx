import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDetailPanel } from "@/components/ProductDetailPanel";
import { createServerClient } from "@/lib/supabase-server";
import { getSiteSettings } from "@/lib/siteSettings";
import { featuredProducts, navCategories } from "@/lib/data";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function mapRow(row: Record<string, unknown>): Product {
  return {
    id:               String(row.id),
    name:             String(row.name),
    slug:             String(row.slug),
    description:      String(row.description ?? ""),
    price:            Number(row.price),
    salePrice:        row.sale_price ? Number(row.sale_price) : undefined,
    category:         String(row.category_name ?? ""),
    categorySlug:     String(row.category_slug ?? ""),
    subCategory:      String(row.sub_category_name ?? ""),
    subCategorySlug:  String(row.sub_category_slug ?? ""),
    images:           (row.images as string[]) ?? [],
    stock:            Number(row.stock ?? 0),
    isActive:         Boolean(row.is_active ?? true),
    isNew:            Boolean(row.is_new ?? false),
    isBestseller:     Boolean(row.is_bestseller ?? false),
    careInstructions: String(row.care_instructions ?? ""),
  };
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const sb = createServerClient();
    const { data, error } = await sb.from("products").select("*").eq("slug", slug).single();
    if (error || !data) throw error;
    return mapRow(data);
  } catch {
    return featuredProducts.find((p) => p.slug === slug) ?? null;
  }
}

async function getRelated(categorySlug: string, excludeId: string): Promise<Product[]> {
  try {
    const sb = createServerClient();
    const { data, error } = await sb
      .from("products")
      .select("*")
      .eq("category_slug", categorySlug)
      .eq("is_active", true)
      .neq("id", excludeId)
      .limit(4);
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return featuredProducts
      .filter((p) => p.categorySlug === categorySlug && p.id !== excludeId)
      .slice(0, 4);
  }
}

async function getShippingInfo(): Promise<string> {
  try {
    const sb = createServerClient();
    const { data, error } = await sb
      .from("site_settings")
      .select("value")
      .eq("key", "shipping_info")
      .single();
    if (error || !data) throw error;
    return data.value ?? "";
  } catch {
    return "";
  }
}

export async function generateStaticParams() {
  return featuredProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Ürün Bulunamadı" };
  return {
    title: `${product.name} | Best Çiçekçilik`,
    description: product.description ?? `${product.name} — Best Çiçekçilik & Organizasyon.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug }  = await params;
  const product   = await getProduct(slug);
  if (!product || product.isActive === false) notFound();

  const category = navCategories.find((c) => c.slug === product.categorySlug);
  const [related, shippingInfo, siteSettings] = await Promise.all([
    getRelated(product.categorySlug, product.id),
    getShippingInfo(),
    getSiteSettings(),
  ]);
  const inStock = (product.stock ?? 1) > 0;

  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />

      <main className="bg-[#fbf9f8] min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b border-[#e4e2e2] bg-white">
          <div className="container-site py-3">
            <nav className="flex items-center gap-2 text-[11px] text-[#727973]">
              <Link href="/" className="hover:text-[#163426] transition-colors">Ana Sayfa</Link>
              <span>/</span>
              {category && (
                <>
                  <Link href={`/${category.slug}`} className="hover:text-[#163426] transition-colors">
                    {category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-[#163426] font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Ana içerik — iki sütun */}
        <section className="py-10 md:py-16">
          <div className="container-site">
            <div className="grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-8 lg:gap-14 items-start">

              {/* Sol — Galeri */}
              <ProductGallery images={product.images} productName={product.name} />

              {/* Sağ — Detay paneli */}
              <div className="md:sticky md:top-[80px]">
                <ProductDetailPanel
                  product={product}
                  categorySlug={product.categorySlug}
                  inStock={inStock}
                  shippingInfo={shippingInfo}
                  siteSettings={siteSettings}
                />
              </div>
            </div>
          </div>
        </section>

        {/* İlgili ürünler */}
        {related.length > 0 && (
          <section className="py-12 border-t border-[#e4e2e2]">
            <div className="container-site">
              <h2 className="font-heading text-[28px] md:text-[32px] font-medium text-[#163426] mb-8">
                Bunları da beğenebilirsiniz
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {related.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
