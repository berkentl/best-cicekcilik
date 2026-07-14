import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { KayitClient } from "@/components/auth/KayitClient";

export const metadata = {
  title: "Üye Ol | Dünyanın Çiçeği",
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
