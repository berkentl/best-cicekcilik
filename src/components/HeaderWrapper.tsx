import { cookies } from "next/headers";
import { getCategories } from "@/lib/getCategories";
import { Header } from "@/components/Header";

export async function HeaderWrapper() {
  const [categories, cookieStore] = await Promise.all([
    getCategories(),
    cookies(),
  ]);

  const cartCount     = parseInt(cookieStore.get("cart-count")?.value     ?? "0", 10);
  const wishlistCount = parseInt(cookieStore.get("wishlist-count")?.value ?? "0", 10);

  return (
    <Header
      initialCategories={categories}
      initialCartCount={cartCount}
      initialWishlistCount={wishlistCount}
    />
  );
}
