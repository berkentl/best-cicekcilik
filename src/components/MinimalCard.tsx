"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/types";

export function MinimalCard({ product }: { product: Product }) {
  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <Link href={`/urun/${product.slug}`} className="group block">
      {/* Görsel */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-[#f5f3f1]"
        style={{ aspectRatio: "3/4" }}
      >
        <Image
          src={product.images[0] ?? "/images/urunler/urun-1a.jpg"}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-[#7b3535] text-white px-2 py-0.5 rounded-full">
            -%{discountPct}
          </span>
        )}
        {!hasDiscount && product.isNew && (
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-[#fde8e6] text-[#5c2020] px-2 py-0.5 rounded-full">
            YENİ
          </span>
        )}
      </div>

      {/* Ad + Fiyat */}
      <div className="pt-2.5 px-0.5">
        <p className="font-heading text-[13px] sm:text-[15px] font-medium text-[#1d3435] leading-snug line-clamp-2 group-hover:text-[#3d7b74] transition-colors">
          {product.name}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[13px] sm:text-[14px] font-medium text-[#1d3435] tabular-nums">
            {formatPrice(product.salePrice ?? product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] font-normal text-[#aaa] line-through tabular-nums">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
