import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckoutClient } from "./CheckoutClient";
import { createServerClient } from "@/lib/supabase-server";
import { DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";
import type { PaymentSettings, SiteSettings } from "@/types";

const DEFAULT_PAYMENT: PaymentSettings = {
  kapida_enabled: true,
  kapida_fee: 0,
  havale_enabled: true,
  havale_ibans: [],
};

export default async function CheckoutPage() {
  let paymentSettings: PaymentSettings = DEFAULT_PAYMENT;
  let siteSettings: Pick<SiteSettings, "baseShippingFee" | "freeShippingThreshold"> = DEFAULT_SITE_SETTINGS;

  try {
    const sb = createServerClient();
    const [paymentResult, settingsResult] = await Promise.all([
      sb.from("payment_settings").select("kapida_enabled, kapida_fee, havale_enabled, havale_ibans").eq("id", 1).maybeSingle(),
      sb.from("site_settings").select("key, value"),
    ]);

    if (paymentResult.data) {
      paymentSettings = {
        kapida_enabled: paymentResult.data.kapida_enabled ?? true,
        kapida_fee: Number(paymentResult.data.kapida_fee ?? 0),
        havale_enabled: paymentResult.data.havale_enabled ?? true,
        havale_ibans: Array.isArray(paymentResult.data.havale_ibans) ? paymentResult.data.havale_ibans : [],
      };
    }

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
