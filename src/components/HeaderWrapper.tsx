import { cookies } from "next/headers";
import { getCategories } from "@/lib/getCategories";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/Header";

export async function HeaderWrapper() {
  const [categories, cookieStore, user] = await Promise.all([
    getCategories(),
    cookies(),
    getCurrentUser(),
  ]);

  const cartCount     = parseInt(cookieStore.get("cart-count")?.value     ?? "0", 10);
  const wishlistCount = parseInt(cookieStore.get("wishlist-count")?.value ?? "0", 10);

  return (
    <Header
      initialCategories={categories}
      initialCartCount={cartCount}
      initialWishlistCount={wishlistCount}
      initialUser={user}
    />
  );
}
