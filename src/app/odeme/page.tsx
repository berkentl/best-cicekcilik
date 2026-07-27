import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckoutClient } from "./CheckoutClient";
import { createServerClient } from "@/lib/supabase-server";
import { DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";
import { getPaymentSettings } from "@/lib/paymentSettings";
import type { PaymentSettings, SiteSettings } from "@/types";

export default async function CheckoutPage() {
  const paymentSettings: PaymentSettings = await getPaymentSettings();
  let siteSettings: Pick<SiteSettings, "baseShippingFee" | "freeShippingThreshold"> = DEFAULT_SITE_SETTINGS;

  try {
    const sb = createServerClient();
    const settingsResult = await sb.from("site_settings").select("key, value");

    if (settingsResult.data) {
      const map: Record<string, string> = {};
      for (const row of settingsResult.data) map[row.key] = row.value;
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
    // tablo henüz oluşturulmamışsa varsayılanlarla devam et
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <CheckoutClient paymentSettings={paymentSettings} siteSettings={siteSettings} />
      </main>
      <Footer />
    </>
  );
}
