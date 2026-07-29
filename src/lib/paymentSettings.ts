import { createServerClient } from "@/lib/supabase-server";
import type { PaymentSettings } from "@/types";

/**
 * Ödeme ayarları — admin panelinden yönetilir (bkz. /admin/odeme-ayarlari).
 *
 * Hem ödeme adımı hem sipariş onay sayfası aynı ayarları okuduğu için burada
 * paylaşılıyor: IBAN listesi iki yerde ayrı ayrı çözümlenirse biri
 * güncellenmeyi kaçırabilir.
 */

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  kapida_enabled: true,
  kapida_fee: 0,
  havale_enabled: true,
  havale_ibans: [],
  // Kart varsayılan olarak kapalı: PayTR canlı moda geçmeden açılırsa
  // müşteri ödeme adımında test ortamına düşer.
  kart_enabled: false,
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const sb = createServerClient();
    const { data } = await sb
      .from("payment_settings")
      .select("kapida_enabled, kapida_fee, havale_enabled, havale_ibans, kart_enabled")
      .eq("id", 1)
      .maybeSingle();

    if (!data) return DEFAULT_PAYMENT_SETTINGS;

    return {
      kapida_enabled: data.kapida_enabled ?? DEFAULT_PAYMENT_SETTINGS.kapida_enabled,
      kapida_fee: Number(data.kapida_fee ?? DEFAULT_PAYMENT_SETTINGS.kapida_fee),
      havale_enabled: data.havale_enabled ?? DEFAULT_PAYMENT_SETTINGS.havale_enabled,
      havale_ibans: Array.isArray(data.havale_ibans) ? data.havale_ibans : [],
      kart_enabled: data.kart_enabled ?? DEFAULT_PAYMENT_SETTINGS.kart_enabled,
    };
  } catch (err) {
    console.error("[paymentSettings] okunamadı:", err);
    return DEFAULT_PAYMENT_SETTINGS;
  }
}
