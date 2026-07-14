"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { NoiseBackground } from "@/components/ui/noise-background";
import type { Product } from "@/types";

interface SpotlightBannerProps {
  allProducts: Product[];
}

const TABS = [
  { label: "En Çok Satanlar", filter: (p: Product) => p.isBestseller },
  { label: "Yeni Gelenler",   filter: (p: Product) => p.isNew },
  { label: "Tüm Ürünler",    filter: () => true },
];

export function SpotlightBanner({ allProducts }: SpotlightBannerProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (allProducts.length === 0) return null;

  const tabProducts = allProducts.filter(TABS[activeTab].filter).slice(0, 6);
  const displayProducts = tabProducts.length > 0 ? tabProducts : allProducts.slice(0, 6);

  return (
    <section className="py-16 bg-[#f9f7f4]">
      <div className="container-site">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[11px] text-[#999] uppercase tracking-[0.25em] mb-3">
            Dünyanın Çiçeği Koleksiyonu
          </p>
          <h2 className="font-heading text-[26px] md:text-[40px] font-medium text-[#1d3435] leading-tight mb-6">
            Sevdiklerine Özel Çiçekler
          </h2>

          {/* Tab buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 border"
                style={{
                  background: activeTab === i ? "#3d7b74" : "transparent",
                  color: activeTab === i ? "#ffffff" : "#545454",
                  borderColor: activeTab === i ? "#3d7b74" : "#d5d5d5",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div
          key={activeTab}
          className="grid grid-cols-2 lg:grid-cols-3 gap-[10px] sm:gap-[15px] fade-up"
        >
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-10">
          <NoiseBackground
            containerClassName="rounded-[2px] p-[2px]"
            gradientColors={[
              "rgb(58, 112, 115)",
              "rgb(45, 82, 84)",
              "rgb(80, 150, 155)",
            ]}
            noiseIntensity={0.18}
            speed={0.07}
          >
            <Link
              href="/tum-urunler"
              className="inline-flex items-center gap-2 bg-[#1d3435] hover:bg-[#2a4e50] text-white px-8 py-3 text-[12px] font-semibold tracking-[0.15em] uppercase transition-all duration-200"
            >
              Tüm Ürünleri İncele
            </Link>
          </NoiseBackground>
        </div>
      </div>
    </section>
  );
}
