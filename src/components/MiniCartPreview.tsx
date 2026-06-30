"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

export function MiniCartPreview() {
  const flash     = useCartStore((s) => s.flash);
  const clearFlash = useCartStore((s) => s.clearFlash);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(clearFlash, 3500);
    return () => clearTimeout(t);
  }, [flash, clearFlash]);

  const product = flash?.product;
  const imgSrc  = product?.images?.[0] ?? "/images/urunler/urun-1a.jpg";
  const price   = product ? (product.salePrice ?? product.price) : 0;

  return (
    <AnimatePresence>
      {flash && product && (
        <motion.div
          key={product.id + "-flash"}
          initial={{ opacity: 0, x: 60, y: 0 }}
          animate={{ opacity: 1, x: 0,  y: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          onMouseEnter={clearFlash}
          className="fixed top-[72px] right-4 z-[200] w-[min(320px,calc(100vw-32px))]"
        >
          <Link href="/sepet" onClick={clearFlash}>
            <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(22,52,38,0.16)] border border-[#e8e8e8] overflow-hidden">
              {/* Yeşil çizgi üst */}
              <div className="h-1 bg-[#163426]" />

              <div className="flex items-center gap-3 p-3.5">
                {/* Ürün görseli */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f5f3f3] flex-shrink-0">
                  <Image src={imgSrc} alt={product.name} fill unoptimized className="object-cover" />
                </div>

                {/* Bilgi */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#3d7b74] mb-0.5">
                    Sepete Eklendi ✓
                  </p>
                  <p className="text-[13px] font-semibold text-[#1b1c1c] leading-snug line-clamp-2">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] font-bold text-[#163426]">
                      ₺{price.toLocaleString("tr-TR")}
                    </span>
                    {flash.quantity > 1 && (
                      <span className="text-[10px] text-[#999]">× {flash.quantity}</span>
                    )}
                  </div>
                </div>

                {/* Ok */}
                <svg className="w-4 h-4 text-[#c1c8c2] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="px-3.5 pb-3.5">
                <div className="bg-[#163426] text-white text-[12px] font-bold text-center py-2.5 rounded-xl tracking-[0.05em]">
                  Sepete Git →
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
