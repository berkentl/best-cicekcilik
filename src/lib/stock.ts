/**
 * Stok eşikleri.
 *
 * Bu değer İKİ yerde kullanılıyor: yönetici panelindeki "Kritik Stok" kartı
 * ve stok düşümünde tetiklenen bildirim. Tek kaynakta tutulmasının sebebi,
 * ikisinin birbirinden kayması hâlinde "kritik stok" ifadesinin panelde ve
 * bildirimde farklı şey anlamına gelmesi — yönetici panelde 3 ürün görürken
 * bildirimi hiç almadığında sisteme güvenmez.
 *
 * Sunucu tarafı bağımlılığı YOK; bu yüzden hem istemci bileşenlerinden hem
 * sunucu kodundan güvenle içe alınabilir.
 */

/** Bu değerin ALTINA düşen stok kritik sayılır (yani 5 kritik değil, 4 kritik). */
export const LOW_STOCK_THRESHOLD = 5;
