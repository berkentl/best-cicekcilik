import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/data";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "İletişim | Best Çiçekçilik",
  description:
    "Best Çiçekçilik & Organizasyon iletişim bilgileri. Şişli/İstanbul'da aynı gün çiçek teslimatı için bize ulaşın.",
};

const hours = [
  { day: "Pazartesi – Cuma", time: "08:00 – 21:00" },
  { day: "Cumartesi", time: "08:00 – 21:00" },
  { day: "Pazar", time: "09:00 – 20:00" },
];

export default function ContactPage() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main>
        {/* Hero */}
        <div className="bg-[#f5f0eb] py-12 text-center border-b border-[#e8e8e8]">
          <div className="container-site">
            <nav className="flex items-center justify-center gap-2 text-[12px] text-[#999] mb-4">
              <Link href="/" className="hover:text-[#1d3435] transition-colors">
                Ana Sayfa
              </Link>
              <span>/</span>
              <span className="text-[#1d3435] font-medium">İletişim</span>
            </nav>
            <h1 className="font-heading text-3xl md:text-4xl text-[#1d3435] font-medium">
              İletişim
            </h1>
            <p className="text-[#545454] text-sm mt-3 max-w-md mx-auto">
              Sorularınız için bize ulaşın. Aynı gün teslimat ve özel tasarım
              çiçekler için hizmetinizdeyiz.
            </p>
          </div>
        </div>

        <section className="py-12 md:py-20">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Sol — iletişim bilgileri */}
              <div>
                <h2 className="font-heading text-xl text-[#1d3435] font-medium mb-8">
                  Bize Ulaşın
                </h2>

                <div className="space-y-6">
                  {/* Adres */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-[#f5f0eb] flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-[#3d7b74]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1">
                        Adres
                      </p>
                      <p className="text-[14px] text-[#545454] leading-relaxed">
                        {siteConfig.address}
                        <br />
                        {siteConfig.district} / {siteConfig.city}
                      </p>
                    </div>
                  </div>

                  {/* Telefon */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-[#f5f0eb] flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-[#3d7b74]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1">
                        Telefon
                      </p>
                      <a
                        href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                        className="text-[14px] text-[#545454] hover:text-[#1d3435] transition-colors"
                      >
                        {siteConfig.phone}
                      </a>
                    </div>
                  </div>

                  {/* E-posta */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-[#f5f0eb] flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-[#3d7b74]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1">
                        E-posta
                      </p>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="text-[14px] text-[#545454] hover:text-[#1d3435] transition-colors"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                  </div>

                  {/* Çalışma saatleri */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-[#f5f0eb] flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-[#3d7b74]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-widest text-[#1d3435] mb-2">
                        Çalışma Saatleri
                      </p>
                      <div className="space-y-1">
                        {hours.map((h) => (
                          <div
                            key={h.day}
                            className="flex justify-between gap-6 text-[13px] text-[#545454]"
                          >
                            <span>{h.day}</span>
                            <span className="font-medium text-[#1d3435]">
                              {h.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Harita */}
                <div className="mt-8 rounded-sm overflow-hidden border border-[#e8e8e8]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.3994040849765!2d28.992220!3d41.067810!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7a8f2a2a861%3A0x1234567890abcdef!2sAytekin%20Kotil%20Cd.%20No%3A18%2C%2034360%20%C5%9Ei%C5%9Fli%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1234567890"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Best Çiçekçilik Konum"
                  />
                </div>
              </div>

              {/* Sağ — iletişim formu */}
              <div>
                <h2 className="font-heading text-xl text-[#1d3435] font-medium mb-8">
                  Mesaj Gönderin
                </h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
