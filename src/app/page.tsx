import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { HeroSlider } from "@/components/HeroSlider";
import { TrustTicker } from "@/components/TrustTicker";
import { ProductGrid } from "@/components/ProductGrid";
import { SpotlightBanner } from "@/components/SpotlightBanner";
import { DeliverySection } from "@/components/DeliverySection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { HakkimizdaSection } from "@/components/HakkimizdaSection";
import { Footer } from "@/components/Footer";
import { getVitrinProducts } from "@/lib/vitrin";

export const revalidate = 60; // ISR: 60 saniyede bir yenile

export default async function HomePage() {
  const vitrinProducts = await getVitrinProducts();
  const displayProducts = vitrinProducts;

  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />

      <main>
        {/* Hero Slider */}
        <HeroSlider />

        {/* Güven & Ödeme Bilgileri — kayan şerit */}
        <TrustTicker />

        {/* En Sevilen Ürünler — hibrit vitrin */}
        <ProductGrid
          animatedTitle
          products={displayProducts}
          viewAllHref="/en-sevilen"
          viewAllText="Tümünü Gör"
        />

        {/* Teslimat Haritası — Türkiye geneli kargo */}
        <DeliverySection />

        {/* Spotlight — tabbed product sections */}
        <SpotlightBanner allProducts={displayProducts} />

        {/* Müşteri Yorumları — kayan kart şeridi */}
        <ReviewsSection />

        {/* Hakkımızda — marka hikayesi, hizmetler, istatistikler, CTA */}
        <HakkimizdaSection />
      </main>

      <Footer />
    </>
  );
}
