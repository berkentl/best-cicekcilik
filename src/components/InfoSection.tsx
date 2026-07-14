import Link from "next/link";
import Image from "next/image";

export function InfoSection() {
  return (
    <>
      {/* "En Havalı Tasarım Çiçekler" block */}
      <section className="py-16 bg-white">
        <div className="container-site">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] text-[#999] uppercase tracking-[0.25em] mb-3">
                Dünyanın Çiçeği
              </p>
              <h2 className="font-heading text-[32px] md:text-[38px] font-medium text-[#1d3435] leading-tight mb-5">
                En Havalı Tasarım
                <br />
                Çiçekler Burada
              </h2>
              <p className="text-[14px] text-[#545454] leading-relaxed mb-6">
                Şişli/İstanbul&apos;da bulunan atölyemizde her gün taze çiçeklerle
                hazırlanan özel tasarımlarımız, sevdiklerinize en güzel şekilde
                ulaşıyor. Aynı gün teslimat ile İstanbul&apos;un her noktasına çiçek
                gönderiyoruz.
              </p>
              <Link href="/hakkimizda" className="btn-link">
                Bizi Tanıyın
              </Link>
            </div>
            <div className="relative aspect-square bg-[#f5f0eb] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div
                    className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: "#e8f0ef" }}
                  >
                    <span className="font-heading text-5xl text-[#1d3435]">D</span>
                  </div>
                  <p className="font-heading text-[20px] text-[#1d3435] font-medium">
                    Dünyanın Çiçeği
                  </p>
                  <p className="text-[12px] text-[#999] tracking-widest uppercase mt-1">
                    Çiçekçilik &amp; Organizasyon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "Kişiye Özel Kart Notları" block */}
      <section className="py-14 bg-[#f9f7f4]">
        <div className="container-site">
          <div className="text-center max-w-xl mx-auto">
            <p className="text-[11px] text-[#999] uppercase tracking-[0.25em] mb-3">
              Kişiye Özel
            </p>
            <h2 className="font-heading text-[28px] font-medium text-[#1d3435] mb-4">
              Kart Notları ile Duygularını Aktarsın
            </h2>
            <p className="text-[14px] text-[#545454] leading-relaxed mb-7">
              Sevdiğinize göndereceğiniz çiçeklerle birlikte kişiselleştirilmiş
              kart notunuzu da ekleyebilirsiniz. Her çiçek teslimatımızda ücretsiz
              kart hizmeti sunuyoruz.
            </p>
            <Link href="/tum-urunler" className="btn-primary inline-flex">
              Çiçek Gönder
            </Link>
          </div>
        </div>
      </section>

      {/* Brand hero bottom section */}
      <section className="py-16 bg-[#1d3435] text-white text-center">
        <div className="container-site">
          <p className="text-[11px] text-white/60 uppercase tracking-[0.3em] mb-3">
            Şişli, İstanbul
          </p>
          <h2 className="font-heading text-[36px] md:text-[48px] font-medium leading-tight mb-5">
            Dünyanın
            <br />
            <span className="text-[#8bbdb9]">Çiçeği</span>
          </h2>
          <p className="text-[14px] text-white/70 max-w-md mx-auto mb-8 leading-relaxed">
            Fulya, 19 Mayıs, Aytekin Kotil Cd. No:18, 34360 Şişli/İstanbul
            <br />
            <a href="tel:05322959309" className="text-white/90 hover:text-white transition-colors mt-1 block">
              0532 295 93 09
            </a>
          </p>
          <Link
            href="/tum-urunler"
            className="inline-flex items-center gap-2 bg-white text-[#1d3435] px-8 py-3 text-[13px] font-semibold uppercase tracking-wider hover:bg-[#f0f0f0] transition-colors"
          >
            Çiçek Alışverişine Başla
          </Link>
        </div>
      </section>
    </>
  );
}
