import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { GirisClient } from "@/components/auth/GirisClient";

export const metadata = {
  // Kullaniciya ozel / islem sayfasi - arama sonucunda degeri yok.
  robots: { index: false, follow: true },
  title: "Giriş Yap",
  description: "Hesabınıza giriş yaparak siparişlerinizi ve adreslerinizi yönetin.",
};

export default function GirisPage() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main>
        <GirisClient />
      </main>
      <Footer />
    </>
  );
}
