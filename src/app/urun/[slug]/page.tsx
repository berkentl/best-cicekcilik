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
import { navCategories } from "@/lib/data";
import { JsonLd } from "@/components/JsonLd";
import {
  absoluteUrl,
  buildOpenGraph,
  productSchema,
  breadcrumbSchema,
  OG_IMAGE_URL,
  type BreadcrumbItem,
} from "@/lib/seo";
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
    // Yönetici panelindeki SEO Başlığı / SEO Açıklaması alanları buraya
    // okunmuyordu; girilen değerler sessizce yok sayılıyor, sayfa her zaman
    // ürün adına düşüyordu.
    seoTitle:         String(row.seo_title ?? ""),
    seoDescription:   String(row.seo_description ?? ""),
  };
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const sb = createServerClient();
    const { data, error } = await sb.from("products").select("*").eq("slug", slug).single();
    if (error || !data) throw error;
    return mapRow(data);
  } catch {
    return null;
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
      .limit(8);
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return [];
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

/** Meta açıklamayı 155 karakter sınırında, kelime ortasından kesmeden kısaltır. */
function kisalt(text: string, max = 155): string {
  const temiz = text.replace(/\s+/g, " ").trim();
  if (temiz.length <= max) return temiz;
  const kesik = temiz.slice(0, max - 1);
  const bosluk = kesik.lastIndexOf(" ");
  return `${(bosluk > max * 0.6 ? kesik.slice(0, bosluk) : kesik).trimEnd()}…`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    // Bulunamayan ürün indekslenmemeli; aksi hâlde silinen ürünler
    // arama sonuçlarında kalıp kullanıcıyı boş sayfaya götürür.
    return { title: "Ürün Bulunamadı", robots: { index: false, follow: true } };
  }

  const fiyat = product.salePrice ?? product.price;
  const path = `/urun/${product.slug}`;

  /* Panelde SEO alanı doldurulmuşsa o kullanılır; yoksa ürün adı ve fiyattan
     üretilir. Fiyatın açıklamada yer alması tıklama oranını yükseltiyor. */
  const title = product.seoTitle?.trim() || product.name;
  const description = kisalt(
    product.seoDescription?.trim() ||
      product.description?.trim() ||
      `${product.name} — ₺${fiyat.toLocaleString("tr-TR")}. İstanbul'a aynı gün teslimat, teslimat öncesi görsel onay.`
  );

  const gorseller = (product.images ?? []).filter(Boolean).map(absoluteUrl);

  return {
    title,
    description,
    alternates: { canonical: path },
    // Ürün fotoğrafı varsa OG görseli o olur — bağlantı WhatsApp'ta
    // paylaşıldığında marka görseli değil ürünün kendisi görünmeli.
    openGraph: buildOpenGraph({
      title,
      description,
      path,
      images: gorseller.slice(0, 4),
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [gorseller[0] ?? OG_IMAGE_URL],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug }  = await params;
  const product   = await getProduct(slug);
  if (!product) notFound();

  const category = navCategories.find((c) => c.slug === product.categorySlug);
  const [related, shippingInfo, siteSettings] = await Promise.all([
    getRelated(product.categorySlug, product.id),
    getShippingInfo(),
    getSiteSettings(),
  ]);
  const inStock = product.isActive !== false && (product.stock ?? 0) > 0;

  /* Kırıntı yolu ekrandaki gezinme çubuğuyla birebir aynı sırayı izler;
     farklı bir hiyerarşi bildirmek Google tarafından tutarsızlık sayılır. */
  const breadcrumb: BreadcrumbItem[] = [{ name: "Ana Sayfa", path: "/" }];
  if (category) breadcrumb.push({ name: category.name, path: `/${category.slug}` });
  if (product.subCategory && product.subCategorySlug) {
    breadcrumb.push({
      name: product.subCategory,
      path: `/${product.categorySlug}/${product.subCategorySlug}`,
    });
  }
  breadcrumb.push({ name: product.name });

  return (
    <>
      <JsonLd
        data={[
          productSchema(product, { shippingFee: siteSettings.baseShippingFee }),
          breadcrumbSchema(breadcrumb),
        ]}
      />
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
