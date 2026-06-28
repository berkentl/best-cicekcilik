import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { CartContent } from "@/components/CartContent";

export const metadata = {
  title: "Sepetim | Best Çiçekçilik & Organizasyon",
};

export default function CartPage() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <CartContent />
      <Footer />
    </>
  );
}
