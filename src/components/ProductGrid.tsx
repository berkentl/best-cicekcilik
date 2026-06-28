import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { AnimatedSectionTitle } from "@/components/AnimatedSectionTitle";
import { NoiseBackground } from "@/components/ui/noise-background";
import type { Product } from "@/types";

interface ProductGridProps {
  title?: string;
  animatedTitle?: boolean;
  products: Product[];
  viewAllHref?: string;
  viewAllText?: string;
}

export function ProductGrid({
  title,
  animatedTitle = false,
  products,
  viewAllHref = "/tum-urunler",
  viewAllText = "Tümünü Gör",
}: ProductGridProps) {
  return (
    <section className="py-16 bg-[#fbf9f8]">
      <div className="container-site">
        {(title || animatedTitle) && (
          <div className="mb-10">
            {animatedTitle ? (
              <div className="flex flex-col items-center text-center">
                <AnimatedSectionTitle />
              </div>
            ) : (
              <div className="flex items-end justify-between">
                <h2 className="font-heading text-[32px] md:text-[40px] font-medium text-[#1d3435] leading-tight">
                  {title}
                </h2>
                <Link
                  href={viewAllHref}
                  className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.05em] uppercase text-[#1d3435] border-b border-[#1d3435] pb-0.5 hover:opacity-60 transition-opacity"
                >
                  {viewAllText}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 2 kolon mobil, 4 masaüstü */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <NoiseBackground
            containerClassName="rounded-[2px] p-[2px]"
            gradientColors={[
              "rgb(253, 180, 170)",
              "rgb(249, 164, 152)",
              "rgb(255, 210, 200)",
            ]}
            noiseIntensity={0.15}
            speed={0.08}
          >
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 bg-[#fde8e6] hover:bg-[#f9d5d2] text-[#5c2020] px-12 py-4 text-[12px] font-semibold tracking-[0.15em] uppercase transition-all duration-300"
            >
              Daha Fazla Keşfet
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </Link>
          </NoiseBackground>
        </div>
      </div>
    </section>
  );
}
