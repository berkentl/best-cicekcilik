import type { Metadata } from "next";
import { Kumbh_Sans, Playfair_Display, Poppins, Cormorant_Garamond } from "next/font/google";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { StoreHydration } from "@/components/StoreHydration";
import { MiniCartPreview } from "@/components/MiniCartPreview";
import "./globals.css";

const kumbhSans = Kumbh_Sans({
  variable: "--font-kumbh-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Best Çiçekçilik & Organizasyon | Aynı Gün Çiçek Teslimat - Şişli/İstanbul",
  description:
    "Best Çiçekçilik & Organizasyon olarak Şişli/İstanbul'da aynı gün lüks çiçek teslimatı yapıyoruz. Buket, vazo aranjmanı, orkide ve daha fazlası.",
  keywords: "çiçekçi, istanbul çiçekçi, aynı gün çiçek, şişli çiçekçi, lüks çiçek",
  openGraph: {
    title: "Best Çiçekçilik & Organizasyon",
    description: "İstanbul'a Aynı Gün Lüks Çiçek Teslimat",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${kumbhSans.variable} ${playfairDisplay.variable} ${poppins.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <StoreHydration />
        <MiniCartPreview />
        <CurrencyProvider>
        {children}
        </CurrencyProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
