import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const REVIEWS = [
  {
    quote: "Doğum günü sürprizim için sipariş verdim, çiçekler tam zamanında ve inanılmaz tazeydi. Eşim çok mutlu oldu, teşekkürler Best Çiçekçilik!",
    name: "Selin A.",
    title: "Doğum Günü Siparişi",
    rating: 5,
  },
  {
    quote: "Anneme Anneler Günü'nde gönderdim. Paketleme muhteşemti, çiçekler bir hafta boyunca taze kaldı. Kesinlikle tavsiye ederim.",
    name: "Murat K.",
    title: "Anneler Günü Siparişi",
    rating: 5,
  },
  {
    quote: "Şişli'de en iyi çiçekçi bu. Hem kalite hem fiyat hem de teslimat hızı için 5 yıldız. Sevgililer Günü'nde bile aynı gün teslim ettiler.",
    name: "Elif T.",
    title: "Sevgililer Günü Siparişi",
    rating: 5,
  },
  {
    quote: "Düğün çiçeklerimi Best Çiçekçilik hazırladı. Gelin buketi ve masa süslemeleri hayalimden bile güzeldi. Çok teşekkürler!",
    name: "Zeynep & Emre",
    title: "Düğün Organizasyonu",
    rating: 5,
  },
  {
    quote: "Orkide aranjmanı için sipariş verdim, ürün fotoğraftaki gibi geldi. Hem güzel hem de dayanıklı. Bir daha alacağım kesinlikle.",
    name: "Deniz B.",
    title: "Orkide Siparişi",
    rating: 5,
  },
  {
    quote: "İş yerimiz için her ay düzenli sipariş veriyoruz. Her seferinde aynı kalite ve güler yüzlü hizmet. Gerçek profesyoneller.",
    name: "Ayşe M.",
    title: "Kurumsal Müşteri",
    rating: 5,
  },
  {
    quote: "Ankaralıyım, İstanbul'daki arkadaşıma gönderttim. Tam zamanında teslim edildi ve arkadaşım çok mutlu oldu. Harika hizmet!",
    name: "Can Ö.",
    title: "Şehirlerarası Teslimat",
    rating: 5,
  },
];

export function ReviewsSection() {
  return (
    <section className="py-20 bg-[#faf8f5] overflow-hidden">
      <div className="container-site mb-12">
        {/* Başlık */}
        <div className="text-center">
          <p className="text-[11px] text-[#b09a8a] uppercase tracking-[0.25em] mb-3">
            Müşteri Yorumları
          </p>
          <h2 className="font-heading text-[26px] md:text-[38px] font-medium text-[#1d3435] leading-tight">
            Sevdikleriniz Ne Diyor?
          </h2>
          <p className="mt-3 text-[14px] text-[#8a7060] max-w-md mx-auto">
            Binlerce mutlu müşterimizin deneyimlerine kulak verin.
          </p>
        </div>

        {/* Genel puan */}
        <div className="flex items-center justify-center gap-3 mt-7">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#e8a87c" stroke="#e8a87c" strokeWidth="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span className="text-[15px] font-semibold text-[#1d3435]">5.0</span>
          <span className="text-[13px] text-[#9b8b7e]">· 10.000+ mutlu müşteri</span>
        </div>
      </div>

      {/* Kayan kartlar */}
      <InfiniteMovingCards
        items={REVIEWS}
        direction="left"
        speed="normal"
        pauseOnHover
      />
    </section>
  );
}
