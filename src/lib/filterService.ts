import type { Product, FilterCategory, FilterOption } from "@/types";

/**
 * Çiçekçilik mağazası için varsayılan filtre kategorileri.
 * DB entegrasyonunda bu veriler /api/filter-categories endpoint'inden gelecek.
 *
 * matchFields sırası önemlidir:
 *   "tags"        → Ürün tags dizisinde tam eşleşme arar (hızlı, kesin)
 *   "subCategory" → Alt kategori adında büyük/küçük harf duyarsız arama
 *   "name"        → Ürün adında arama
 *   "description" → Açıklamada arama (en geniş ağ, en son çare)
 *
 * Tags alanı doldurulduğunda matchFields kısaltılabilir: sadece ["tags"].
 */
export const DEFAULT_FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: "dizayn",
    label: "Dizayn Türleri",
    defaultOpen: true,
    matchFields: ["tags", "subCategory", "name"],
    options: [
      { value: "Buket",           label: "Buket" },
      { value: "Vazo Aranjman",   label: "Vazo Aranjman" },
      { value: "Çikolata & Çiçek",label: "Çikolata & Çiçek" },
      { value: "Kutuda Çiçek",    label: "Kutuda Çiçek" },
      { value: "Hediye Kutusu",   label: "Hediye Kutusu" },
      { value: "Kişiye Özel",     label: "Kişiye Özel" },
      { value: "Sepette Çiçek",   label: "Sepette Çiçek" },
      { value: "Minimal",         label: "Minimal" },
      { value: "Deluxe",          label: "Deluxe" },
      { value: "Luxury",          label: "Luxury" },
      { value: "Empire Deluxe",   label: "Empire Deluxe" },
      { value: "Royal Deluxe",    label: "Royal Deluxe" },
      { value: "Saksıda Ekili",   label: "Saksıda Ekili" },
      { value: "Ek Hediye",       label: "Ek Hediye" },
    ],
  },
  {
    id: "cicek",
    label: "Çiçek Çeşitleri",
    defaultOpen: false,
    matchFields: ["tags", "subCategory", "name", "description"],
    options: [
      { value: "Gül",                  label: "Gül" },
      { value: "Şakayık",              label: "Şakayık" },
      { value: "Lale",                 label: "Lale" },
      { value: "Orkide",               label: "Orkide" },
      { value: "Ortanca",              label: "Ortanca" },
      { value: "Anastasia",            label: "Anastasia" },
      { value: "Antoryum",             label: "Antoryum" },
      { value: "Delfinyum",            label: "Delfinyum" },
      { value: "Sümbül",               label: "Sümbül" },
      { value: "Ayçiçeği & Papatya",   label: "Ayçiçeği & Papatya" },
      { value: "Çardak Gül",           label: "Çardak Gül" },
      { value: "Gala",                 label: "Gala" },
      { value: "Gerbera",              label: "Gerbera" },
      { value: "Protea & Banksia",     label: "Protea & Banksia" },
      { value: "Bitki",                label: "Bitki" },
      { value: "Kaktüs & Sukulent",    label: "Kaktüs & Sukulent" },
      { value: "Krizantem",            label: "Krizantem" },
      { value: "Okaliptus",            label: "Okaliptus" },
      { value: "Kuru Çiçek",           label: "Kuru Çiçek" },
      { value: "Zeytin",               label: "Zeytin" },
      { value: "Bal Kabağı",           label: "Bal Kabağı" },
      { value: "Kokina & İlex",        label: "Kokina & İlex" },
      { value: "Mimoza",               label: "Mimoza" },
    ],
  },
  {
    id: "renk",
    label: "Renk",
    defaultOpen: false,
    matchFields: ["tags", "name", "description"],
    options: [
      { value: "Kırmızı",      label: "Kırmızı" },
      { value: "Bej",          label: "Bej" },
      { value: "Beyaz",        label: "Beyaz" },
      { value: "Bordo",        label: "Bordo" },
      { value: "Cappuccino",   label: "Cappuccino" },
      { value: "Fusya",        label: "Fusya" },
      { value: "Galaxy",       label: "Galaxy" },
      { value: "Gold",         label: "Gold" },
      { value: "Gri",          label: "Gri" },
      { value: "Kahverengi",   label: "Kahverengi" },
      { value: "Lila",         label: "Lila" },
      { value: "Mor",          label: "Mor" },
      { value: "Pembe",        label: "Pembe" },
      { value: "Somon",        label: "Somon" },
      { value: "Turuncu",      label: "Turuncu" },
    ],
  },
];

/**
 * Bir ürünün belirli bir filtre değeriyle eşleşip eşleşmediğini kontrol eder.
 * matchFields sırasına göre kontrol yapılır; ilk eşleşmede true döner.
 */
function productMatchesValue(
  product: Product,
  value: string,
  matchFields: Array<"tags" | "subCategory" | "name" | "description">
): boolean {
  const needle = value.toLowerCase();

  for (const field of matchFields) {
    switch (field) {
      case "tags":
        if (product.tags?.some(t => t.toLowerCase() === needle)) return true;
        break;
      case "subCategory":
        if (product.subCategory?.toLowerCase().includes(needle)) return true;
        break;
      case "name":
        if (product.name?.toLowerCase().includes(needle)) return true;
        break;
      case "description":
        if (product.description?.toLowerCase().includes(needle)) return true;
        break;
    }
  }
  return false;
}

/**
 * Bir ürünün seçili filtrelerin TAMAMIYLA eşleşip eşleşmediğini kontrol eder.
 *
 * Mantık:
 *   - Gruplar arası: AND  (seçili her grup karşılanmalı)
 *   - Grup içi:      OR   (grup içinde en az bir seçenek eşleşmeli)
 *
 * Fiyat filtresi bu fonksiyonun dışında ayrıca uygulanır.
 */
export function matchProduct(
  product: Product,
  selectedFilters: Record<string, string[]>,
  filterCategories: FilterCategory[]
): boolean {
  for (const category of filterCategories) {
    const selected = selectedFilters[category.id];
    if (!selected || selected.length === 0) continue; // bu grup için seçim yok, geç

    const fields = category.matchFields ?? ["tags", "name", "description"];
    const groupMatches = selected.some(value =>
      productMatchesValue(product, value, fields)
    );
    if (!groupMatches) return false; // AND: bir grup eşleşmezse ürünü ele
  }
  return true;
}

/**
 * Ürün listesinden dinamik filtre kategorileri oluşturur ve her seçeneğe
 * o seçenekle eşleşen ürün sayısını (count) ekler.
 *
 * Kullanım: Kategori sayfası sunucu tarafında products'ı çektikten sonra
 * bu fonksiyonu çağırarak mevcut ürünlere göre filtre seçeneklerini kısaltabilir.
 *
 * DB entegrasyonunda bu işlevi sunucu/API üstlenir; count'lar SQL aggregation ile gelir.
 */
export function buildFilterCategories(
  products: Product[],
  baseCategories: FilterCategory[] = DEFAULT_FILTER_CATEGORIES
): FilterCategory[] {
  return baseCategories.map(category => {
    const fields = category.matchFields ?? ["tags", "name", "description"];
    const optionsWithCount: FilterOption[] = category.options.map(opt => ({
      ...opt,
      count: products.filter(p => productMatchesValue(p, opt.value, fields)).length,
    }));
    return { ...category, options: optionsWithCount };
  });
}
