import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dünyanın Çiçeği",
    short_name: "Dünyanın Çiçeği",
    description: "İstanbul'a aynı gün lüks çiçek teslimatı.",
    start_url: "/",
    display: "standalone",
    background_color: "#1d3435",
    theme_color: "#1d3435",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
