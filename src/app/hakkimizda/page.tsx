import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { HakkimizdaSection } from "@/components/HakkimizdaSection";

export const metadata: Metadata = {
  title: "Hakkımızda | Dünyanın Çiçeği",
  description: "Dünyanın Çiçeği hakkında bilgi edinin. İstanbul Şişli'de lüks çiçek tasarımı ve organizasyon hizmetleri.",
};

export default function HakkimizdaPage() {
  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main>
        <HakkimizdaSection />
      </main>
      <Footer />
    </>
  );
}
