import type { CartItem } from "@/store/cartStore";
import type { SiteSettings, ShippingZone } from "@/types";

/* ── Varsayılan İstanbul ilçe bölgeleri ────────────────────────
   Admin API'ye bağlanana kadar bu liste kullanılır.
   0 TL extra = aynı gün teslimat bölgesi.
───────────────────────────────────────────────────────────────── */
export const DEFAULT_SHIPPING_ZONES: ShippingZone[] = [
  // Aynı gün bölgesi (0 TL extra)
  { id: "besiktas",   name: "Beşiktaş",   extraFee: 0,   isActive: true },
  { id: "sisli",      name: "Şişli",      extraFee: 0,   isActive: true },
  { id: "beyoglu",    name: "Beyoğlu",    extraFee: 0,   isActive: true },
  { id: "nisantasi",  name: "Nişantaşı",  extraFee: 0,   isActive: true },
  { id: "sariyer",    name: "Sarıyer",    extraFee: 0,   isActive: true },
  { id: "eyup",       name: "Eyüp",       extraFee: 0,   isActive: true },
  { id: "kagithane",  name: "Kağıthane",  extraFee: 0,   isActive: true },
  { id: "bakirkoy",   name: "Bakırköy",   extraFee: 0,   isActive: true },
  { id: "fatih",      name: "Fatih",      extraFee: 0,   isActive: true },
  { id: "eminonu",    name: "Eminönü",    extraFee: 0,   isActive: true },
  // Uzak bölgeler (+extra)
  { id: "uskudar",    name: "Üsküdar",    extraFee: 100, isActive: true },
  { id: "kadikoy",    name: "Kadıköy",    extraFee: 100, isActive: true },
  { id: "maltepe",    name: "Maltepe",    extraFee: 150, isActive: true },
  { id: "atasehir",   name: "Ataşehir",   extraFee: 150, isActive: true },
  { id: "umraniye",   name: "Ümraniye",   extraFee: 150, isActive: true },
  { id: "pendik",     name: "Pendik",     extraFee: 200, isActive: true },
  { id: "kartal",     name: "Kartal",     extraFee: 200, isActive: true },
  { id: "tuzla",      name: "Tuzla",      extraFee: 250, isActive: true },
  { id: "avcilar",    name: "Avcılar",    extraFee: 100, isActive: true },
  { id: "bahcelievler",name:"Bahçelievler",extraFee: 100, isActive: true },
  { id: "zeytinburnu",name: "Zeytinburnu",extraFee: 100, isActive: true },
  { id: "bagcilar",   name: "Bağcılar",   extraFee: 150, isActive: true },
  { id: "buyukcekmece",name:"Büyükçekmece",extraFee:200, isActive: true },
  { id: "esenyurt",   name: "Esenyurt",   extraFee: 200, isActive: true },
  { id: "basaksehir", name: "Başakşehir", extraFee: 150, isActive: true },
  { id: "arnavutkoy", name: "Arnavutköy", extraFee: 250, isActive: true },
  { id: "gaziosmanpasa",name:"Gaziosmanpaşa",extraFee:100,isActive:true},
  { id: "esenler",    name: "Esenler",    extraFee: 150, isActive: true },
  { id: "gungoren",   name: "Güngören",   extraFee: 100, isActive: true },
  { id: "sultangazi", name: "Sultangazi", extraFee: 200, isActive: true },
  { id: "sultanbeyli",name: "Sultanbeyli",extraFee: 200, isActive: true },
  { id: "sancaktepe", name: "Sancaktepe", extraFee: 200, isActive: true },
  { id: "cekmekoy",   name: "Çekmeköy",   extraFee: 200, isActive: true },
  { id: "beykoz",     name: "Beykoz",     extraFee: 200, isActive: true },
  { id: "sile",       name: "Şile",       extraFee: 300, isActive: true },
  { id: "catalca",    name: "Çatalca",    extraFee: 300, isActive: true },
  { id: "silivri",    name: "Silivri",    extraFee: 300, isActive: true },
];

export interface ShippingResult {
  fee:           number;   // Nihai kargo ücreti (TL)
  isFree:        boolean;  // Ücretsiz kargo limitinden mi?
  zoneExtra:     number;   // İlçe ek ücreti
  customOverride:boolean;  // Ürüne özel ücret devredeydi mi?
}

/**
 * 3 adımlı kargo hesaplama:
 * 1. Seçilen ilçenin zone.extraFee + settings.baseShippingFee
 * 2. Sepette customShippingFee olan ürün varsa, baz kargo ücretini o değerle ezip kullan
 * 3. Sepet toplamı >= freeShippingThreshold ise → 0 TL
 */
export function calculateShipping(
  items: CartItem[],
  zone: ShippingZone | null,
  settings: Pick<SiteSettings, "baseShippingFee" | "freeShippingThreshold">,
  discountAmount = 0
): ShippingResult {
  const rawTotal = items.reduce(
    (sum, i) => sum + (i.product.salePrice ?? i.product.price) * i.quantity,
    0
  );
  const cartTotal = Math.max(0, rawTotal - discountAmount);

  // Adım 1 — ilçe bazlı kargo
  const zoneExtra = zone?.extraFee ?? 0;
  let fee = settings.baseShippingFee + zoneExtra;

  // Adım 2 — ürüne özel kargo varsa standart kargoyu ez
  const customFees = items
    .map((i) => i.product.customShippingFee)
    .filter((f): f is number => f !== undefined && f >= 0);

  let customOverride = false;
  if (customFees.length > 0) {
    const maxCustom = Math.max(...customFees);
    fee = maxCustom + zoneExtra;
    customOverride = true;
  }

  // Adım 3 — ücretsiz kargo limiti
  if (
    settings.freeShippingThreshold > 0 &&
    cartTotal >= settings.freeShippingThreshold
  ) {
    return { fee: 0, isFree: true, zoneExtra, customOverride };
  }

  return { fee, isFree: false, zoneExtra, customOverride };
}

/** Kalan tutarı hesapla (ücretsiz kargo için ne kadar daha gerekiyor) */
export function remainingForFreeShipping(
  items: CartItem[],
  threshold: number,
  discountAmount = 0
): number {
  const total = items.reduce(
    (sum, i) => sum + (i.product.salePrice ?? i.product.price) * i.quantity,
    0
  );
  return Math.max(0, threshold - Math.max(0, total - discountAmount));
}
