import type { SiteSettings, Announcement } from "@/types";
import { createServerClient } from "@/lib/supabase-server";

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "default-1",
    text: "Saat 14'e kadar verilen siparişlerde; Tüm İstanbul'a Aynı Gün Çiçek Teslimat yapıyoruz.",
    durationSec: 5,
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcements:         DEFAULT_ANNOUNCEMENTS,
  announcementActive:    true,
  freeShippingThreshold: 3000,
  baseShippingFee:       200,
  businessName:          "Dünyanın Çiçeği",
  phone:                 "0532 295 93 09",
  email:                 "info@dunyanincicegi.com",
  address:               "Fulya, 19 Mayıs, Aytekin Kotil Cd. No:18, 34360 Şişli/İstanbul",
};

/** Sunucu tarafında site ayarlarını çeker (Supabase → fallback mock). */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const sb = createServerClient();
    const { data, error } = await sb.from("site_settings").select("key, value");
    if (error) throw error;

    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.key] = row.value;

    /* Çoklu duyuru → JSON array */
    let announcements: Announcement[] = DEFAULT_ANNOUNCEMENTS;
    if (map["announcements"]) {
      try {
        const parsed = JSON.parse(map["announcements"]) as Announcement[];
        if (Array.isArray(parsed) && parsed.length > 0) announcements = parsed;
      } catch { /* fallback */ }
    } else if (map["announcement_text"]) {
      /* Geriye dönük uyumluluk — eski tek metin */
      announcements = [{ id: "legacy", text: map["announcement_text"], durationSec: 5 }];
    }

    return {
      announcements,
      announcementActive:
        map["announcement_active"] !== undefined
          ? map["announcement_active"] === "true"
          : DEFAULT_SITE_SETTINGS.announcementActive,
      freeShippingThreshold:
        map["free_shipping_threshold"] !== undefined
          ? Number(map["free_shipping_threshold"])
          : DEFAULT_SITE_SETTINGS.freeShippingThreshold,
      baseShippingFee:
        map["base_shipping_fee"] !== undefined
          ? Number(map["base_shipping_fee"])
          : DEFAULT_SITE_SETTINGS.baseShippingFee,
      businessName: map["business_name"] || DEFAULT_SITE_SETTINGS.businessName,
      phone:        map["phone"]         || DEFAULT_SITE_SETTINGS.phone,
      email:        map["email"]         || DEFAULT_SITE_SETTINGS.email,
      address:      map["address"]       || DEFAULT_SITE_SETTINGS.address,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
