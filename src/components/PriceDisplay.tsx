"use client";

import { formatPrice } from "@/lib/currency";

interface PriceDisplayProps {
  price: number;
  salePrice?: number;
  discountPct?: number;
  className?: string;
}

export function PriceDisplay({ price, salePrice, discountPct, className }: PriceDisplayProps) {
  const hasDiscount = salePrice !== undefined && salePrice < price;

  return (
    <div className={`flex items-baseline gap-3 ${className ?? ""}`}>
      <span className="text-2xl font-bold text-[#1d3435]">
        {formatPrice(hasDiscount ? salePrice! : price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-base text-[#999] line-through">
            {formatPrice(price)}
          </span>
          <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
            %{discountPct} indirim
          </span>
        </>
      )}
    </div>
  );
}
