import { createServerClient } from "@/lib/supabase-server";
import { PaymentSettingsClient } from "./PaymentSettingsClient";
import type { PaymentSettings } from "@/types";

const DEFAULT_SETTINGS: PaymentSettings = {
  kapida_enabled: true,
  kapida_fee: 0,
  havale_enabled: true,
  havale_ibans: [],
};

export default async function OdemeAyarlariPage() {
  let settings: PaymentSettings = DEFAULT_SETTINGS;

  try {
    const sb = createServerClient();
    const { data } = await sb
      .from("payment_settings")
      .select("kapida_enabled, kapida_fee, havale_enabled, havale_ibans")
      .eq("id", 1)
      .maybeSingle();

    if (data) {
      settings = {
        kapida_enabled: data.kapida_enabled ?? true,
        kapida_fee: Number(data.kapida_fee ?? 0),
        havale_enabled: data.havale_enabled ?? true,
        havale_ibans: Array.isArray(data.havale_ibans) ? data.havale_ibans : [],
      };
    }
  } catch {
    // tablo henüz oluşturulmamışsa varsayılanlarla devam et
  }

  return <PaymentSettingsClient initial={settings} />;
}
