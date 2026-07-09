import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { SifremiUnuttumClient } from "@/components/auth/SifremiUnuttumClient";

export const metadata = {
  title: "Şifremi Unuttum | Best Çiçekçilik",
  description: "Hesabınız için şifre sıfırlama bağlantısı talep edin.",
};

export default function SifremiUnuttumPage() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main>
        <SifremiUnuttumClient />
      </main>
      <Footer />
    </>
  );
}
