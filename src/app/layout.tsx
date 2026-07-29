import type { Metadata } from "next";
import { Kumbh_Sans, Playfair_Display, Poppins, Cormorant_Garamond, Montserrat, Dancing_Script } from "next/font/google";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { StoreHydration } from "@/components/StoreHydration";
import { MiniCartPreview } from "@/components/MiniCartPreview";
import { JsonLd } from "@/components/JsonLd";
import {
  SITE_URL,
  OG_IMAGE_URL,
  organizationSchema,
  websiteSchema,
  floristSchema,
} from "@/lib/seo";
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

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const SITE_TITLE = "Dünyanın Çiçeği | Aynı Gün Çiçek Teslimat — Şişli/İstanbul";
const SITE_DESCRIPTION =
  "İstanbul Şişli'de lüks çiçek tasarımı. Saat 12:00'a kadar verilen siparişlerde aynı gün teslimat, teslimat öncesi görsel onay ve taze çiçek garantisi.";

export const metadata: Metadata = {
  /**
   * metadataBase olmadan Next.js openGraph görsellerini ve canonical
   * bağlantılarını mutlak URL'ye çeviremiyor; göreli kalan OG görselleri
   * WhatsApp ve sosyal ağlarda hiç görünmüyor.
   */
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    /** Alt sayfalar yalnızca kendi başlığını verir, marka otomatik eklenir. */
    template: "%s | Dünyanın Çiçeği",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Dünyanın Çiçeği",
  /*
    Kök düzeyde canonical TANIMLANMIYOR. Tanımlandığında Next.js bunu kendi
    canonical'ını belirtmeyen her sayfaya miras veriyor ve /iletisim, /giris
    gibi sayfalar ana sayfanın kopyası olduğunu bildiriyordu — Google'a
    yanlış sinyal. Canonical her sayfada kendi yolunu yazar.
  */
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Dünyanın Çiçeği",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Dünyanın Çiçeği — İstanbul'a aynı gün lüks çiçek teslimatı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Zengin sonuçlarda görsel ön izlemesinin kısıtlanmaması için.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dünyanın Çiçeği",
  },
};

export const viewport = {
  themeColor: "#1d3435",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${kumbhSans.variable} ${playfairDisplay.variable} ${poppins.variable} ${cormorantGaramond.variable} ${montserrat.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/*
          Site geneli yapısal veri. Her sayfada bir kez bulunur ve sayfaya
          özel şemalar (Product, CollectionPage, BreadcrumbList) sabit @id'ler
          üzerinden buraya referans verir — böylece Google satıcı, marka ve
          işletme bilgisini tek bir varlıkta birleştirebiliyor.
        */}
        <JsonLd data={[organizationSchema(), websiteSchema(), floristSchema()]} />
        <StoreHydration />
        <MiniCartPreview />
        {children}
        <WhatsAppButton />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
