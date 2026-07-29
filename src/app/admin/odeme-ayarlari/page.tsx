import { createServerClient } from "@/lib/supabase-server";
import { PaymentSettingsClient, type PaytrStatus } from "./PaymentSettingsClient";
import { getPaytrCredentials } from "@/lib/paytr";
import type { PaymentSettings } from "@/types";

const DEFAULT_SETTINGS: PaymentSettings = {
  kapida_enabled: true,
  kapida_fee: 0,
  havale_enabled: true,
  havale_ibans: [],
  kart_enabled: false,
};

export default async function OdemeAyarlariPage() {
  let settings: PaymentSettings = DEFAULT_SETTINGS;

  try {
    const sb = createServerClient();
    const { data, error } = await sb
      .from("payment_settings")
      .select("kapida_enabled, kapida_fee, havale_enabled, havale_ibans, kart_enabled")
      .eq("id", 1)
      .maybeSingle();

    // Sessiz düşüş burada özellikle tehlikeli: yönetici paneli kayıtlı
    // IBAN'ları boş gösterir, işletme sahibi silinmiş sanıp yeniden girer
    // ve mükerrer kayıt oluşur.
    if (error) {
      console.error(`[odeme-ayarlari] ayarlar okunamadı: ${error.message}`);
    }

    if (data) {
      settings = {
        kapida_enabled: data.kapida_enabled ?? true,
        kapida_fee: Number(data.kapida_fee ?? 0),
        havale_enabled: data.havale_enabled ?? true,
        havale_ibans: Array.isArray(data.havale_ibans) ? data.havale_ibans : [],
        kart_enabled: data.kart_enabled ?? false,
      };
    }
  } catch {
    // tablo henüz oluşturulmamışsa varsayılanlarla devam et
  }

  /* Yalnızca durum bilgisi istemciye geçer — anahtar ve salt asla. */
  const creds = getPaytrCredentials();
  const paytr: PaytrStatus = {
    configured: creds !== null,
    testMode: creds?.testMode ?? true,
    merchantId: creds?.merchantId ?? null,
  };

  return <PaymentSettingsClient initial={settings} paytr={paytr} />;
}
