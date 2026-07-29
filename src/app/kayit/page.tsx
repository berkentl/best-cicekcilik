import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { KayitClient } from "@/components/auth/KayitClient";

export const metadata = {
  // Kullaniciya ozel / islem sayfasi - arama sonucunda degeri yok.
  robots: { index: false, follow: true },
  title: "Üye Ol",
  description: "Dünyanın Çiçeği ailesine katılın, siparişlerinizi tek yerden takip edin.",
};

export default function KayitPage() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main>
        <KayitClient />
      </main>
      <Footer />
    </>
  );
}
