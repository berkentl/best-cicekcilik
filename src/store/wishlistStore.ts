import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

interface WishlistStore {
  items: Product[];
  toggle: (product: Product) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.some((i) => i.id === product.id);
        set({
          items: exists
            ? get().items.filter((i) => i.id !== product.id)
            : [...get().items, product],
        });
      },
      has: (productId) => get().items.some((i) => i.id === productId),
      clear: () => set({ items: [] }),
    }),
    { name: "best-cicekcilik-wishlist", skipHydration: true }
  )
);

// Her değişiklikte favori sayısını cookie'ye yaz (SSR okuyabilsin)
useWishlistStore.subscribe((state) => {
  setCookie("wishlist-count", String(state.items.length));
});
