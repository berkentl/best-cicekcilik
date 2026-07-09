import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { SifreSifirlaClient } from "@/components/auth/SifreSifirlaClient";

export const metadata = {
  title: "Şifre Sıfırla | Best Çiçekçilik",
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
