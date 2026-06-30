import type { Metadata } from "next";
import { Kumbh_Sans, Playfair_Display, Poppins } from "next/font/google";
import { WhatsAppIcon } from "@/components/icons";
import { siteConfig } from "@/lib/data";
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
      className={`${kumbhSans.variable} ${playfairDisplay.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <StoreHydration />
        <MiniCartPreview />
        <CurrencyProvider>
        {children}
        </CurrencyProvider>
        {/* WhatsApp floating butonu */}
        <a
          href={`https://wa.me/${siteConfig.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile iletişim"
          className="fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
        >
          <WhatsAppIcon size={28} className="text-white" />
        </a>
      </body>
    </html>
  );
}
