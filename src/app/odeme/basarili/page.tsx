import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sipariş Alındı | Best Çiçekçilik",
};

export default function OrderSuccessPage() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container-site max-w-lg text-center">
            <div className="w-20 h-20 rounded-full bg-[#f0f9f6] flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-[#3d7b74]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="font-heading text-3xl text-[#1d3435] font-medium mb-3">
              Siparişiniz Alındı!
            </h1>
            <p className="text-[#545454] text-sm leading-relaxed mb-2">
              Siparişinizi aldık. Floristimiz en kısa sürede hazırlığa başlayacak
              ve belirlediğiniz saatte teslimat yapılacaktır.
            </p>
            <p className="text-[#999] text-[13px] mb-10">
              Sipariş takibi için lütfen telefonu arayın veya WhatsApp'tan ulaşın.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/" className="btn-primary">
                Ana Sayfaya Dön
              </Link>
              <Link
                href={`https://wa.me/905322959309`}
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25d366] text-white text-[13px] font-semibold rounded-sm hover:bg-[#20ba58] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp&apos;tan Takip Et
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
