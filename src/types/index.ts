export interface ProductVariant {
  id?: string;
  productId?: string;
  label: string;
  price: number;
  stock: number;
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  categorySlug: string;
  subCategory?: string;
  subCategorySlug?: string;
  badge?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isActive?: boolean;
  isPinnedToVitrin?: boolean;
  salesCount?: number;
  stock?: number;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  careInstructions?: string;
  extraCategorySlugs?: { categorySlug: string; subCategorySlug?: string }[];
  variants?: ProductVariant[];
  tags?: string[];
  /** Ürüne özel sabit kargo ücreti. Varsa, ilçe ücretini ezer. */
  customShippingFee?: number;
}

/** Tek bir duyuru şeridi kaydı */
export interface Announcement {
  id:          string;
  text:        string;
  durationSec: number; // kaç saniye gösterilsin (varsayılan 5)
}

/**
 * Global site + kampanya ayarları.
 * Admin panelinden yönetilir, /api/site-settings üzerinden okunur/yazılır.
 */
export interface SiteSettings {
  announcements:          Announcement[];
  announcementActive:     boolean;
  freeShippingThreshold:  number;
  baseShippingFee:        number;
  businessName:           string;
  phone:                  string;
  email:                  string;
  address:                string;
}

/**
 * İlçe bazlı kargo bölgesi.
 * Admin → Kargo Bölgeleri bölümünden yönetilir.
 */
export interface ShippingZone {
  id:        string;
  name:      string;   // "Beşiktaş"
  extraFee:  number;   // Baz ücrete eklenen fark (TL). 0 = aynı gün bölgesi.
  isActive:  boolean;
}

/**
 * Filtre içindeki tek bir seçenek.
 * DB entegrasyonunda filter_options tablosundan gelecek.
 */
export interface FilterOption {
  /** Ürün etiketleriyle eşleştirilen değer (ör. "Buket", "Kırmızı") */
  value: string;
  /** Arayüzde gösterilen metin */
  label: string;
  /** Kaç ürünle eşleşiyor (opsiyonel — buildFilterCategories ile hesaplanır) */
  count?: number;
}

/**
 * Filtre grubu — bir accordion bölümüne karşılık gelir.
 * DB entegrasyonunda filter_categories tablosundan gelecek.
 */
export interface FilterCategory {
  /** Benzersiz kimlik ve selectedFilters state'inde anahtar olarak kullanılır */
  id: string;
  /** Accordion başlığı (ör. "Dizayn Türleri") */
  label: string;
  /** Bu gruptaki seçenekler */
  options: FilterOption[];
  /** Accordion varsayılan açık mı? */
  defaultOpen?: boolean;
  /**
   * Eşleşme sırasında hangi ürün alanlarına bakılacak.
   * "tags" önce kontrol edilir; tags boşsa sonrakiler devreye girer.
   * DB entegrasyonunda sadece "tags" bırakılacak.
   */
  matchFields?: Array<"tags" | "subCategory" | "name" | "description">;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  displayOrder?: number;
  subCategories?: SubCategory[];
  megaMenu?: MegaMenuColumn[];
}

export interface SubCategory {
  name: string;
  slug: string;
}

export interface MegaMenuColumn {
  heading: string;
  items: SubCategory[];
}

export interface HeroSlide {
  id: string;
  image: string;
  mobileImage?: string;
  alt: string;
  heading?: string;
  subHeading?: string;
  buttonText?: string;
  buttonHref?: string;
  textPosition?: "left" | "center" | "right";
}

export interface SpotlightTab {
  label: string;
  products: Product[];
}

export interface IbanEntry {
  id: string;
  bank: string;
  holder: string;
  iban: string;
}

export interface PaymentSettings {
  kapida_enabled: boolean;
  kapida_fee: number;
  havale_enabled: boolean;
  havale_ibans: IbanEntry[];
}

export interface SiteConfig {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  mapUrl?: string;
  whatsapp?: string;
  announcementText: string;
}

/** Oturum açmış müşteri — şifre hash'i asla client'a gönderilmez. */
export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  kvkkConsent?: boolean;
  marketingConsent?: boolean;
  createdAt?: string;
}

/** Müşterinin kayıtlı teslimat/fatura adresi. */
export interface Address {
  id: string;
  userId: string;
  title: string;
  recipientName: string;
  recipientPhone: string;
  city: string;
  district: string;
  fullAddress: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface OrderItem {
  productId?: string;
  name: string;
  qty: number;
  price: number;
}

export type OrderStatus =
  | "Yeni"
  | "Hazırlanıyor"
  | "Kargoya Verildi"
  | "Teslim Edildi"
  | "İptal"
  | "İade";

/** Müşteri panelinde ("/hesabim/siparislerim") gösterilen sipariş özeti. */
export interface CustomerOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  trackingStep: number;
  trackingNumber?: string;
  address: string;
  recipientName: string;
  deliveryDate?: string;
  deliveryTime?: string;
  createdAt: string;
}
