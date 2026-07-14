import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { OrderTracking } from "@/components/OrderTracking";

export const metadata = {
  title: "Sipariş Takip | Dünyanın Çiçeği",
  description: "Sipariş numaranız ve e-posta adresinizle siparişinizin teslimat durumunu öğrenin.",
};

export default function SiparisTakipPage() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main>
        <OrderTracking />
      </main>
      <Footer />
    </>
  );
}
