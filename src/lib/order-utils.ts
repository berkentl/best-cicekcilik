/**
 * Sipariş numarası üretir — örn. "ORDMS368Q72XET".
 *
 * Yalnızca harf ve rakam içerir, ayırıcı kullanılmaz. Bunun nedeni ödeme
 * altyapısı: PayTR `merchant_oid` alanı için "en fazla 64 alfanumerik
 * karakter" şartı koyuyor ve tire içeren numaralar reddedilebiliyor.
 * Numara hem sipariş takibinde hem ödeme eşleştirmesinde hem de havale
 * açıklamasında aynı biçimde kullanıldığı için tek bir gösterim tutuluyor;
 * iki temsil arasında dönüşüm yapmak eşleştirme hatasına açık olurdu.
 *
 * Teklik: milisaniye damgası (base36) + 5 rastgele karakter (~60 milyon
 * kombinasyon). Çarpışma için aynı milisaniyede iki siparişin aynı rastgele
 * eki alması gerekir. orders.order_number sütunu ayrıca veri tabanında
 * UNIQUE olduğundan çarpışma sessizce mükerrer kayda değil, hataya yol açar;
 * rastgele ek bu nedenle bilinçli olarak geniş tutuluyor.
 */
export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD${ts}${rand}`;
}

export function formatOrderDate(date: Date): string {
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
