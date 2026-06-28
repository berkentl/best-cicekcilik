import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FavorilerClient } from "./FavorilerClient";

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
