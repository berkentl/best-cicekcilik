import type { CartItem } from "@/store/cartStore";
import type { SiteSettings } from "@/types";

/*
  Kargo ücreti, hizmet verilen bölgenin tamamında sabit tutar olarak
  uygulanır (settings.baseShippingFee). İlçe/mesafe bazlı farklılaştırma
  ileride ayrı bir km hesaplama servisiyle kurulacaktır; o güne kadar
  yanıltıcı olmaması için burada yarım bir bölge yapısı tutulmuyor.

  Yasal karşılığı: Mesafeli Satış Sözleşmesi m.4.4-4.6 ve Teslimat
  Bilgileri m.4 — bkz. docs/legal/
*/

export interface ShippingResult {
  fee:           number;   // Nihai kargo ücreti (TL)
  isFree:        boolean;  // Ücretsiz kargo limitinden mi?
  customOverride:boolean;  // Ürüne özel ücret devredeydi mi?
}

/**
 * 2 adımlı kargo hesaplama:
 * 1. Sabit kargo ücreti (settings.baseShippingFee) — sepette customShippingFee
 *    olan ürün varsa baz ücreti o değerle ez
 * 2. Sepet toplamı >= freeShippingThreshold ise → 0 TL
 */
export function calculateShipping(
  items: CartItem[],
  settings: Pick<SiteSettings, "baseShippingFee" | "freeShippingThreshold">,
  _discountAmount = 0   // artık kullanılmıyor; eşik indirim öncesi tutara göre belirlenir
): ShippingResult {
  const rawTotal = items.reduce(
    (sum, i) => sum + (i.product.salePrice ?? i.product.price) * i.quantity,
    0
  );

  // Adım 1 — sabit kargo, ürüne özel ücret varsa onunla ezilir
  let fee = settings.baseShippingFee;

  const customFees = items
    .map((i) => i.product.customShippingFee)
    .filter((f): f is number => f !== undefined && f >= 0);

  let customOverride = false;
  if (customFees.length > 0) {
    fee = Math.max(...customFees);
    customOverride = true;
  }

  // Adım 2 — ücretsiz kargo limiti (indirim öncesi sepet toplamına göre)
  if (
    settings.freeShippingThreshold > 0 &&
    rawTotal >= settings.freeShippingThreshold
  ) {
    return { fee: 0, isFree: true, customOverride };
  }

  return { fee, isFree: false, customOverride };
}

/** Kalan tutarı hesapla (ücretsiz kargo için ne kadar daha gerekiyor — indirim öncesi toplam) */
export function remainingForFreeShipping(
  items: CartItem[],
  threshold: number,
  _discountAmount = 0   // artık kullanılmıyor
): number {
  const total = items.reduce(
    (sum, i) => sum + (i.product.salePrice ?? i.product.price) * i.quantity,
    0
  );
  return Math.max(0, threshold - total);
}
