"use client";

import { useLayoutEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export function StoreHydration() {
  useLayoutEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);
  return null;
}
