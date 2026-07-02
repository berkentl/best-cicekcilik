"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { formatPrice } from "@/lib/currency";
import { HeartIcon } from "@/components/icons";
import { BestsellerBadge } from "@/components/ui/award-badge";

const PLACEHOLDER = "/images/urunler/urun-1a.jpg";

function StarRow({ count = 5, size = 13 }: { count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          className={i < count ? "text-[#c4806a] fill-current" : "text-[#ddd] fill-current"}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
    </div>
  );
}

interface ProductCardProps { product: Product; className?: string; }

export function ProductCard({ product, className }: ProductCardProps) {
  const [added, setAdded]       = useState(false);
  const [imgStyle, setImgStyle] = useState<React.CSSProperties>({});
  const cardRef = useRef<HTMLDivElement>(null);

  const addItem         = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const wishlisted      = has(product.id);
  const currency        = useCurrencyStore((s) => s.currency);
  const rates           = useCurrencyStore((s) => s.rates);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  /* Parallax — sadece desktop hover'da (pointer: fine) */
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    setImgStyle({ transform: `scale(1.08) translate(${(x-0.5)*6}px,${(y-0.5)*6}px)` });
  };
  const onMouseLeave = () => setImgStyle({ transform: "scale(1) translate(0px,0px)" });

  const mainImg     = product.images[0] ?? PLACEHOLDER;
  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;

  const idHash = product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const stars = product.isBestseller ? 5 : (idHash % 2 === 0 ? 5 : 4);
  const reviewCount = product.salesCount || (24 + (idHash % 97));

  // Bestseller için holografik badge ayrıca render edilir
  const pillBadge = !product.isBestseller
    ? hasDiscount
      ? { label: `-%${discountPct}`, bg: "bg-[#7b3535] text-white" }
      : product.isNew
      ? { label: "YENİ", bg: "bg-[#fde8e6] text-[#5c2020]" }
      : product.badge
      ? { label: product.badge, bg: "bg-[#e5e2dd] text-[#1c1c19]" }
      : null
    : null;

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        "group flex flex-col bg-white rounded-2xl p-2.5 sm:p-4 cursor-pointer transition-all duration-500",
        className
      )}
      style={{ boxShadow: "0 12px 40px -10px rgba(22,52,38,0.08)", transitionProperty: "box-shadow,transform" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 20px 50px -12px rgba(22,52,38,0.14)";
        el.style.transform = "translateY(-4px)";
      }}
      onMouseOut={(e) => {
        if (!cardRef.current?.contains(e.relatedTarget as Node)) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "0 12px 40px -10px rgba(22,52,38,0.08)";
          el.style.transform = "translateY(0)";
        }
      }}
    >
      {/* ── Görsel ── */}
      <Link
        href={`/urun/${product.slug}`}
        className="relative rounded-xl overflow-hidden mb-2.5 sm:mb-4 block bg-[#f5f3f1]"
        style={{ aspectRatio: "4/5" }}
      >
        <Image
          src={mainImg}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 25vw"
          className="object-cover object-center"
          style={{ transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)", ...imgStyle }}
        />

        {/* Holografik En Çok Satan rozeti */}
        {product.isBestseller && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-[130px] sm:w-[155px] z-10"
            onClick={(e) => e.preventDefault()}>
            <BestsellerBadge />
          </div>
        )}

        {/* Normal pill badge — indirim / yeni */}
        {pillBadge && (
          <span className={cn(
            "absolute top-2.5 left-2.5 sm:top-4 sm:left-4 font-semibold text-[10px] sm:text-[12px] tracking-[0.05em] px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm",
            pillBadge.bg
          )}>
            {pillBadge.label}
          </span>
        )}

        <button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          aria-label="Favorilere ekle"
          className={cn(
            "absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md",
            "translate-y-[-6px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300",
            wishlisted ? "bg-[#fde8e6]" : "bg-white"
          )}
        >
          <HeartIcon size={13} className={wishlisted ? "fill-[#c8746a] stroke-[#c8746a]" : "text-[#1d3435]"} />
        </button>

        <button
          onClick={handleAddToCart}
          aria-label="Sepete ekle"
          className={cn(
            "absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg",
            "translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300",
            added ? "bg-[#3d7b74]" : "bg-[#1d3435] hover:bg-[#2d4b3c]"
          )}
        >
          {added ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          )}
        </button>
      </Link>

      {/* ── Bilgi ── */}
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <span className="text-[9px] sm:text-[11px] font-semibold tracking-[0.1em] uppercase text-[#424844]">
          {product.category}
        </span>

        <Link
          href={`/urun/${product.slug}`}
          className="font-sans text-[13px] sm:text-[20px] font-semibold text-[#1d3435] leading-tight hover:text-[#3d7b74] transition-colors line-clamp-2"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1.5 my-0.5 sm:my-1">
          <StarRow count={stars} size={10} />
          <span className="text-[9px] sm:text-[11px] text-[#727973]">({reviewCount})</span>
        </div>

        {/* Fiyat — ince serif */}
        <div className="flex items-baseline gap-2 mt-auto pt-0.5">
          <span className="text-[13px] sm:text-[15px] font-medium text-[#1d3435] tabular-nums">
            {formatPrice(product.salePrice ?? product.price, currency, rates)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] sm:text-[12px] font-normal text-[#aaa] line-through tabular-nums">
              {formatPrice(product.price, currency, rates)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
