import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase-server";
import { getCategories } from "@/lib/getCategories";
import { SITE_URL } from "@/lib/seo";

/**
 * Site haritası.
 *
 * Yalnızca indekslenmesini istediğimiz sayfalar listelenir. Hesap, sepet,
 * ödeme ve giriş sayfaları bilinçli olarak DIŞARIDA: kullanıcıya özel veya
 * işlem sayfaları arama sonucunda değersiz, üstelik robots.txt ve sayfa
 * bazlı noindex ile de engelli.
 *
 * changeFrequency ve priority Google tarafından yıllardır yok sayılıyor;
 * yine de diğer arama motorları (Bing, Yandex) için korunuyor. Asıl değer
 * lastModified'da — o yüzden ürün ve kategorilerde veri tabanındaki gerçek
 * updated_at kullanılıyor, sabit tarih yazılmıyor.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = createServerClient();

  const [productsResult, categories] = await Promise.all([
    sb.from("products").select("slug, updated_at").eq("is_active", true),
    getCategories().catch(() => []),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },

    /* Kurumsal — iletişim sayfası yerel SEO için önemli: ticaret unvanı,
       MERSİS, adres, telefon ve çalışma saatleri orada bulunuyor. */
    { url: `${SITE_URL}/iletisim`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/hakkimizda`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/teslimat`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/iade`,       lastModified: now, changeFrequency: "monthly", priority: 0.5 },

    /* Sipariş takip herkese açık bir araç (sipariş no + e-posta ile sorgu);
       müşteriler "dünyanın çiçeği sipariş takip" diye arıyor. Kullanıcıya
       özel veri içermediği için indekslenmesinde sakınca yok. */
    { url: `${SITE_URL}/siparis-takip`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },

    /* Yasal metinler. Bunların indekslenmesi hem 6563 sayılı Kanun'un
       "kolayca ulaşılabilir" şartını destekler hem de ödeme kuruluşu ve
       tüketici incelemelerinde erişilebilirliği kanıtlar. */
    { url: `${SITE_URL}/mesafeli-satis-sozlesmesi`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/on-bilgilendirme-formu`,    lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/kullanim-kosullari`,        lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/kvkk`,                      lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/acik-riza-metni`,           lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/ticari-elektronik-ileti`,   lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/gizlilik`,                  lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  /* Alt kategoriler daha önce hiç listelenmiyordu; oysa "gelin buketi",
     "sevgiliye çiçek" gibi arama niyetine en yakın sayfalar bunlar. */
  const subcategoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) =>
    (cat.megaMenu ?? []).flatMap((col) =>
      col.items.map((item) => ({
        url: `${SITE_URL}/${cat.slug}/${item.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      }))
    )
  );

  const productPages: MetadataRoute.Sitemap = (productsResult.data ?? []).map((p) => ({
    url: `${SITE_URL}/urun/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  /* Aynı URL iki kez listelenmemeli — alt kategori tanımları arasında
     yinelenen slug bulunması hâlinde sitemap geçersiz sayılabiliyor. */
  const all = [...staticPages, ...categoryPages, ...subcategoryPages, ...productPages];
  const seen = new Set<string>();
  return all.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
