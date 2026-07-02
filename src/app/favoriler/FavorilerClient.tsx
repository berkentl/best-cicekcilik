"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useWishlistStore } from "@/store/wishlistStore";

export function FavorilerClient() {
  const { items, clear } = useWishlistStore();

  return (
    <>
      <section className="py-10 md:py-14">
        <div className="container-site">
          {items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-10">
                <button
                  onClick={clear}
                  className="text-[13px] text-[#999] hover:text-red-500 transition-colors underline"
                >
                  Tümünü temizle
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-[#e8e8e8] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-[#999] text-base mb-2">Henüz favori ürün eklemediniz.</p>
              <p className="text-[#bbb] text-sm mb-6">Ürünlerdeki kalp ikonuna tıklayarak favorilere ekleyebilirsiniz.</p>
              <Link href="/tum-urunler" className="btn-primary">
                Ürünleri Keşfet
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
