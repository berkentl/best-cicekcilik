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
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
