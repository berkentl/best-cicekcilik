"use client";

import { useEffect, useState, startTransition } from "react";
import { useWishlistStore } from "@/store/wishlistStore";

/** SSR sırasında bilinmeyen (localStorage tabanlı) favori sayısını hydration sonrası gösterir. */
export function FavoriteCountBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    startTransition(() => setCount(useWishlistStore.getState().items.length));
    return useWishlistStore.subscribe((s) => setCount(s.items.length));
  }, []);

  return <>{count ?? "–"}</>;
}
