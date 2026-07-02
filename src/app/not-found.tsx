import Link from "next/link";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Sayfa Bulunamadı | Best Çiçekçilik",
};

export default function NotFound() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main className="min-h-[70vh] bg-[#faf8f5] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md mx-auto">
          {/* Dekoratif çiçek */}
          <div className="w-24 h-24 rounded-full bg-[#1d3435] flex items-center justify-center mx-auto mb-8 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 3C12 3 9 6 9 9a3 3 0 006 0c0-3-3-6-3-6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9C12 9 15 12 18 12a3 3 0 000-6c-3 0-6 3-6 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9C12 9 9 12 6 12a3 3 0 010-6c3 0 6 3 6 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v12" />
            </svg>
          </div>

          {/* 404 */}
          <p className="text-[80px] font-bold text-[#1d3435]/10 leading-none select-none mb-2">404</p>

          <h1 className="font-sans text-2xl font-semibold text-[#1d3435] mb-3 -mt-4">
            Sayfa Bulunamadı
          </h1>
          <p className="text-[14px] text-[#888] leading-relaxed mb-8">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
            Ana sayfaya dönerek devam edebilirsiniz.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#1d3435] hover:bg-[#2a4a4b] text-white font-semibold text-[14px] px-6 py-3 rounded-xl transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/tum-urunler"
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#e0d9d2] hover:border-[#1d3435] text-[#1d3435] font-semibold text-[14px] px-6 py-3 rounded-xl transition-colors duration-200"
            >
              Ürünlere Bak
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
