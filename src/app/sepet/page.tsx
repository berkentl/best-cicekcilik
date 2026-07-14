import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { CartContent } from "@/components/CartContent";
import { createServerClient } from "@/lib/supabase-server";
import { DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";

export const metadata = {
  title: "Sepetim | Dünyanın Çiçeği",
};

export default async function CartPage() {
  let siteSettings = {
    freeShippingThreshold: DEFAULT_SITE_SETTINGS.freeShippingThreshold,
    baseShippingFee: DEFAULT_SITE_SETTINGS.baseShippingFee,
  };

  try {
    const sb = createServerClient();
    const { data } = await sb.from("site_settings").select("key, value");
    if (data) {
      const map: Record<string, string> = {};
      for (const row of data) map[row.key] = row.value;
      siteSettings = {
        freeShippingThreshold: map["free_shipping_threshold"] !== undefined
          ? Number(map["free_shipping_threshold"])
          : DEFAULT_SITE_SETTINGS.freeShippingThreshold,
        baseShippingFee: map["base_shipping_fee"] !== undefined
          ? Number(map["base_shipping_fee"])
          : DEFAULT_SITE_SETTINGS.baseShippingFee,
      };
    }
  } catch {
    // varsayılanlarla devam et
  }

  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <CartContent siteSettings={siteSettings} />
      <Footer />
    </>
  );
}
