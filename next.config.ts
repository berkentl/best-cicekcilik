import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.ikost.com",
      },
      {
        protocol: "https",
        hostname: "**.ikost.com",
      },
      {
        protocol: "https",
        hostname: "ribbonflowers.com",
      },
      {
        protocol: "https",
        hostname: "www.ribbonflowers.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
