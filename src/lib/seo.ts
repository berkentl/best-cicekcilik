import { siteConfig, legalEntity } from "@/lib/data";
import type { Product } from "@/types";

/**
 * SEO altyapısı — mutlak URL üretimi ve Schema.org JSON-LD blokları.
 *
 * Tüm JSON-LD sunucu tarafında render edilir. Google'ın Aralık 2025 tarihli
 * JavaScript SEO rehberine göre JavaScript ile enjekte edilen yapısal veri
 * gecikmeli işlenebiliyor; Product ve Offer gibi zamana duyarlı işaretlemenin
 * ilk HTML yanıtında bulunması gerekiyor. Bu dosyayı kullanan sayfalar sunucu
 * bileşeni olmalıdır.
 *
 * Şema tipi seçimleri (Haziran 2026 durumu):
 *  - `Florist`: LocalBusiness'ın sektöre özgü alt tipi. Genel LocalBusiness
 *    yerine doğru alt tipi kullanmak yerel sonuçlarda kategori eşleşmesini
 *    güçlendiriyor.
 *  - `Product` + `Offer`: merchant listing için `AggregateOffer` DEĞİL `Offer`
 *    kullanılmalı.
 *  - `BreadcrumbList`, `Organization`, `WebSite`: aktif, serbestçe kullanılır.
 *  - `FAQPage` bilinçli olarak KULLANILMIYOR: Google 7 Mayıs 2026'da tüm
 *    siteler için FAQ zengin sonuçlarını kaldırdı, SERP faydası kalmadı.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://dunyanincicegi.com"
).replace(/\/$/, "");

/** Göreli yolu mutlak URL'ye çevirir. Şemada göreli URL geçersizdir. */
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Varlık kimlikleri — şemalar arası referans için sabit @id'ler. */
export const SCHEMA_ID = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  florist: `${SITE_URL}/#florist`,
} as const;

const LOGO_URL = absoluteUrl("/brand/dunyanin-cicegi-logo-300x100-beyaz.png");
export const OG_IMAGE_URL = absoluteUrl("/seo/og-dunyanin-cicegi.png");

/**
 * Çalışma saatleri — İletişim sayfasında gösterilenle birebir aynı olmalı.
 * Yerel aramalarda "arama anında açık olan işletmeler" daha üstte çıkıyor,
 * dolayısıyla bu verinin doğruluğu doğrudan görünürlüğü etkiliyor.
 */
const OPENING_HOURS = [
  { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "21:00" },
  { days: ["Saturday"], opens: "08:00", closes: "21:00" },
  { days: ["Sunday"], opens: "09:00", closes: "20:00" },
];

/**
 * Teslimat yapılan bölge. Teslimat Bilgileri m.1 ile tutarlı: yalnızca
 * İstanbul. Buraya hizmet verilmeyen bir yer yazmak hem yanıltıcı olur hem
 * de alakasız aramalarda çıkıp tıklama kalitesini düşürür.
 */
const AREA_SERVED = ["İstanbul", "Şişli", "Beşiktaş", "Kağıthane", "Beyoğlu", "Sarıyer"];

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": SCHEMA_ID.organization,
    name: siteConfig.name,
    legalName: legalEntity.tradeName,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: LOGO_URL, width: 300, height: 100 },
    image: OG_IMAGE_URL,
    // VKN, kurumu tekil olarak tanımlayan resmî vergi kimliği.
    taxID: legalEntity.taxNo,
    vatID: legalEntity.taxNo,
    email: siteConfig.email,
    telephone: `+90${siteConfig.phone.replace(/\D/g, "").replace(/^0/, "")}`,
    address: postalAddress(),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+90${siteConfig.phone.replace(/\D/g, "").replace(/^0/, "")}`,
      contactType: "customer service",
      areaServed: "TR",
      availableLanguage: ["Turkish"],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SCHEMA_ID.website,
    url: SITE_URL,
    name: siteConfig.name,
    inLanguage: "tr-TR",
    publisher: { "@id": SCHEMA_ID.organization },
  };
}

function postalAddress() {
  return {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address,
    addressLocality: siteConfig.district,
    addressRegion: siteConfig.city,
    postalCode: "34360",
    addressCountry: "TR",
  };
}

/**
 * Florist şeması — işletmenin fiziksel mağazası olduğu için brick-and-mortar
 * profili uygulanıyor: açık adres, koordinat ve çalışma saatleri birlikte.
 *
 * Koordinatlar en az 5 ondalık basamak taşımalı; daha kaba değerler yerel
 * eşleştirmede güvenilmez sayılıyor.
 */
export function floristSchema() {
  const tel = `+90${siteConfig.phone.replace(/\D/g, "").replace(/^0/, "")}`;
  return {
    "@context": "https://schema.org",
    "@type": "Florist",
    "@id": SCHEMA_ID.florist,
    name: siteConfig.name,
    legalName: legalEntity.tradeName,
    url: SITE_URL,
    logo: LOGO_URL,
    image: OG_IMAGE_URL,
    description:
      "İstanbul Şişli'de lüks çiçek tasarımı. Aynı gün teslimat, teslimat öncesi görsel onay, taze çiçek garantisi.",
    telephone: tel,
    email: siteConfig.email,
    address: postalAddress(),
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.06781,
      longitude: 28.99222,
    },
    // priceRange 100 karakterden kısa olmalı.
    priceRange: "₺₺",
    currenciesAccepted: "TRY",
    paymentAccepted: "Kredi Kartı, Banka Kartı, Banka Havalesi/EFT",
    openingHoursSpecification: OPENING_HOURS.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: AREA_SERVED.map((name) => ({ "@type": "City", name })),
    parentOrganization: { "@id": SCHEMA_ID.organization },
    // Sosyal hesap açıldığında sameAs buraya eklenmeli; boş dizi göndermek
    // yerine alan tamamen dışarıda bırakılıyor.
  };
}

/**
 * Sayfa düzeyinde openGraph nesnesi kurar.
 *
 * Doğrudan `openGraph: {...}` yazmak YETERSİZ: Next.js metadata'yı sığ
 * birleştiriyor, yani sayfada tanımlanan openGraph kök düzendeki openGraph'ı
 * tamamen değiştiriyor. Bu yüzden sayfada yalnızca title/description
 * verildiğinde `og:image`, `og:locale` ve `og:site_name` sessizce kayboluyordu
 * — bağlantı WhatsApp'ta paylaşıldığında görsel çıkmıyordu. Ortak alanlar
 * burada tek yerden yazılıyor.
 */
export function buildOpenGraph(params: {
  title: string;
  description: string;
  path: string;
  images?: string[];
}) {
  const gorseller = params.images?.length ? params.images : [OG_IMAGE_URL];
  return {
    type: "website" as const,
    locale: "tr_TR",
    siteName: siteConfig.name,
    url: absoluteUrl(params.path),
    title: params.title,
    description: params.description,
    images: gorseller.map((url) => ({ url })),
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Site köküne göre yol. Son öğede verilmezse "item" yazılmaz. */
  path?: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

/**
 * Product + Offer şeması.
 *
 * Google'ın zorunlu kıldığı alanlar: `name`, `image`, `offers`. Kurallar:
 *  - `price` para birimi simgesi İÇERMEZ, sayı biçiminde metin olur.
 *  - `priceCurrency` ISO 4217 olmalı → TRY.
 *  - `availability` tam Schema.org URL'si olmalı.
 *  - `image` en az bir yüksek çözünürlüklü mutlak URL içeren dizi olmalı.
 *
 * `aggregateRating` ve `review` BİLİNÇLİ olarak yazılmıyor: sitede henüz
 * gerçek müşteri değerlendirmesi toplanmıyor. Uydurma puan işaretlemek
 * Google'ın yapısal veri politikalarına aykırıdır ve manuel işlem riski
 * taşır. Değerlendirme sistemi kurulduğunda buraya eklenmeli.
 */
export function productSchema(product: Product, opts: { shippingFee: number }) {
  const price = product.salePrice ?? product.price;
  const inStock = product.isActive !== false && (product.stock ?? 0) > 0;
  const url = absoluteUrl(`/urun/${product.slug}`);

  const images = (product.images ?? []).filter(Boolean).map(absoluteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.description ? { description: product.description } : {}),
    sku: product.id,
    url,
    category: product.subCategory ?? product.category,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "TRY",
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": SCHEMA_ID.organization },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: opts.shippingFee.toFixed(2),
          currency: "TRY",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
          addressRegion: "İstanbul",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
        },
      },
      /**
       * İade politikası — İptal ve İade Koşulları metniyle tutarlı olmalı.
       * Çabuk bozulabilen mal niteliği gereği cayma hakkı bulunmadığından
       * `MerchantReturnNotPermitted` bildiriliyor. Buraya gerçek olmayan bir
       * iade süresi yazmak hem yanıltıcı olur hem Google'ın satıcı
       * politikalarına aykırıdır.
       */
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
    },
  };
}

/** Kategori listelerinde kullanılan koleksiyon şeması. */
export function collectionPageSchema(params: {
  name: string;
  description: string;
  path: string;
  productCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.name,
    description: params.description,
    url: absoluteUrl(params.path),
    inLanguage: "tr-TR",
    isPartOf: { "@id": SCHEMA_ID.website },
    ...(params.productCount > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: params.productCount,
          },
        }
      : {}),
  };
}
