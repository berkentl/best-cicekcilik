import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { SifreSifirlaClient } from "@/components/auth/SifreSifirlaClient";

export const metadata = {
  // Kullaniciya ozel / islem sayfasi - arama sonucunda degeri yok.
  robots: { index: false, follow: true },
  title: "Şifre Sıfırla",
  description: "Hesabınız için yeni bir şifre belirleyin.",
};

export default function SifreSifirlaPage() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main>
        <SifreSifirlaClient />
      </main>
      <Footer />
    </>
  );
}
