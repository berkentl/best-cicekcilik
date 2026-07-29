import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FavorilerClient } from "./FavorilerClient";

export const metadata: Metadata = {
  title: "Favorilerim",
  // İçerik tamamen kullanıcıya özel; arama sonucunda karşılığı yok.
  robots: { index: false, follow: true },
};

export default function FavorilerPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <FavorilerClient />
      </main>
      <Footer />
    </>
  );
}
