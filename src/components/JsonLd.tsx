/**
 * Schema.org JSON-LD blokunu sunucu tarafında HTML'e gömer.
 *
 * `next/script` yerine düz `<script>` kullanılıyor: next/script bu içeriği
 * istemcide enjekte ediyor, Google'ın Aralık 2025 JavaScript SEO rehberine
 * göre ise JavaScript ile enjekte edilen yapısal veri gecikmeli işleniyor.
 * Product ve Offer gibi zamana duyarlı işaretlemenin ilk sunucu yanıtında
 * bulunması gerekiyor.
 *
 * `JSON.stringify` çıktısında `<` karakteri kaçırılıyor; aksi hâlde ürün
 * açıklaması gibi kullanıcı tarafından girilen bir alanda `</script>` geçmesi
 * script etiketini erken kapatıp sayfaya HTML enjekte edilmesine yol açabilir.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // Girdi JSON.stringify ile üretiliyor ve `<` kaçırılıyor.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
