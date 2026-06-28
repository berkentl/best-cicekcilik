"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [fade, setFade]     = useState(false);

  const goTo = (i: number) => {
    if (i === active) return;
    setFade(true);
    setTimeout(() => { setActive(i); setFade(false); }, 180);
  };

  const src = images[active] ?? images[0] ?? "/images/urunler/urun-1a.jpg";

  return (
    <div className="flex flex-col gap-4">
      {/* Ana görsel */}
      <div className="relative overflow-hidden rounded-2xl bg-[#f0eeec]" style={{ aspectRatio: "4/5" }}>
        <Image
          src={src}
          alt={productName}
          fill
          unoptimized
          priority
          className={cn(
            "object-cover object-center transition-opacity duration-200",
            fade ? "opacity-0" : "opacity-100"
          )}
          sizes="(max-width: 768px) 100vw, 55vw"
        />
      </div>

      {/* Thumbnail şeridi */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "relative flex-1 overflow-hidden rounded-xl transition-all duration-200 focus:outline-none",
                "border-2",
                i === active
                  ? "border-[#1d3435] shadow-sm"
                  : "border-transparent hover:border-[#c1c8c2]"
              )}
              style={{ aspectRatio: "4/5" }}
            >
              <Image
                src={img}
                alt={`${productName} görsel ${i + 1}`}
                fill
                unoptimized
                className="object-cover object-center"
                sizes="100px"
              />
            </button>
          ))}
          {/* Boş thumbnail yuvaları (4'ten az görsel varsa) */}
          {images.length < 4 &&
            Array.from({ length: 4 - images.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-1 rounded-xl bg-[#f0eeec]"
                style={{ aspectRatio: "4/5" }}
              />
            ))}
        </div>
      )}
    </div>
  );
}
