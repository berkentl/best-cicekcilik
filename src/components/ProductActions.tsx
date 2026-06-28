"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { CartIcon, HeartIcon } from "@/components/icons";
import type { Product } from "@/types";

export function ProductActions({ product, inStock }: { product: Product; inStock: boolean }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const wishlisted = has(product.id);

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleAddToCart}
        disabled={!inStock}
        className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={added ? { background: "#3d7b74" } : {}}
      >
        <CartIcon size={16} />
        {!inStock ? "Stokta Yok" : added ? "Sepete Eklendi ✓" : "Sepete Ekle"}
      </button>

      <button
        onClick={() => toggle(product)}
        className={`w-12 h-12 border rounded-sm flex items-center justify-center transition-colors flex-shrink-0 ${
          wishlisted
            ? "border-red-300 bg-red-50 text-red-500"
            : "border-[#e8e8e8] text-[#545454] hover:text-red-500 hover:border-red-300"
        }`}
        aria-label={wishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        <HeartIcon
          size={18}
          className={wishlisted ? "fill-red-500 stroke-red-500" : ""}
        />
      </button>
    </div>
  );
}
