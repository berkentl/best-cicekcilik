import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckoutClient } from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <CheckoutClient />
      </main>
      <Footer />
    </>
  );
}
