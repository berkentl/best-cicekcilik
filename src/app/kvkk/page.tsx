import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "KVKK Aydınlatma Metni | Best Çiçekçilik",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main className="bg-[#faf8f5]">
        <section className="container-site py-14 md:py-20 max-w-[720px]">
          <h1 className="font-heading text-3xl md:text-4xl font-medium text-[#1d3435] mb-3">
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-[13px] text-[#999] mb-10">Son güncelleme: 2026</p>

          <div className="space-y-8 text-[14px] text-[#3f4a4a] leading-relaxed">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1d3435] mb-2">1. Veri Sorumlusu</h2>
              <p>
                Best Çiçekçilik &amp; Organizasyon (&quot;Best Çiçekçilik&quot;), 6698 sayılı Kişisel Verilerin
                Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla, aşağıda belirtilen
                kişisel verilerinizi işlemektedir.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#1d3435] mb-2">2. İşlenen Kişisel Veriler</h2>
              <p>
                Üyelik, sipariş ve iletişim süreçlerinde ad-soyad, e-posta adresi, telefon numarası,
                teslimat/fatura adresi ve sipariş geçmişi bilgileriniz işlenmektedir.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#1d3435] mb-2">3. İşleme Amaçları</h2>
              <p>
                Verileriniz; hesabınızın oluşturulması ve yönetimi, siparişlerinizin alınması, hazırlanması
                ve teslimatının sağlanması, sipariş durumunuzun tarafınıza bildirilmesi, müşteri
                ilişkilerinin yürütülmesi ve onay vermeniz halinde kampanya/fırsatların tarafınıza
                iletilmesi amaçlarıyla işlenir.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#1d3435] mb-2">4. Verilerin Aktarımı</h2>
              <p>
                Kişisel verileriniz, siparişinizin teslimatını sağlamak amacıyla anlaşmalı kurye/kargo
                firmalarımızla ve yasal yükümlülüklerimiz kapsamında yetkili kamu kurumlarıyla, KVKK&apos;nın
                8. ve 9. maddelerinde belirtilen şartlara uygun olarak paylaşılabilir.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#1d3435] mb-2">5. Haklarınız</h2>
              <p>
                KVKK&apos;nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme,
                işlenmişse buna ilişkin bilgi talep etme, işlenme amacına uygun kullanılıp kullanılmadığını
                öğrenme, yurt içinde/dışında aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse
                düzeltilmesini isteme, silinmesini/yok edilmesini isteme ve bu işlemlerin verilerin
                aktarıldığı üçüncü kişilere bildirilmesini isteme haklarına sahipsiniz.
              </p>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-[#1d3435] mb-2">6. İletişim</h2>
              <p>
                Haklarınızı kullanmak için{" "}
                <a href="mailto:info@bestcicekcilik.com" className="text-[#3d7b74] hover:underline">
                  info@bestcicekcilik.com
                </a>{" "}
                adresinden bizimle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
