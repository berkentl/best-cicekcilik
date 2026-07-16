"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { SearchOverlay } from "@/components/SearchOverlay";
import { UserMenu } from "@/components/UserMenu";
import {
  SearchIcon,
  CartIcon,
  HeartIcon,
  UserIcon,
  MenuIcon,
  ChevronDownIcon,
  XIcon,
  TruckIcon,
} from "@/components/icons";
import { navCategories } from "@/lib/data";
import type { Category, CustomerUser } from "@/types";

interface HeaderProps {
  initialCategories?: Category[];
  initialCartCount?: number;
  initialWishlistCount?: number;
  initialUser?: CustomerUser | null;
}

export function Header({
  initialCategories,
  initialCartCount = 0,
  initialWishlistCount = 0,
  initialUser = null,
}: HeaderProps) {
  const [isScrolled, setIsScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileSub, setMobileSub]         = useState<string | null>(null);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [categories]                      = useState<Category[]>(initialCategories ?? navCategories);
  // SSR'dan gelen cookie değerleriyle başlar → hydration mismatch yok
  const [cartCount, setCartCount]         = useState(initialCartCount);
  const [wishlistCount, setWishlistCount] = useState(initialWishlistCount);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Zustand rehydrasyon tamamlandıktan sonra (StoreHydration useLayoutEffect'i çalışır)
    // şu anki gerçek değerleri al, ardından değişimlere subscribe ol
    startTransition(() => setCartCount(useCartStore.getState().totalItems()));
    startTransition(() => setWishlistCount(useWishlistStore.getState().items.length));
    const unsubCart     = useCartStore.subscribe((s) => setCartCount(s.totalItems()));
    const unsubWishlist = useWishlistStore.subscribe((s) => setWishlistCount(s.items.length));

    return () => {
      window.removeEventListener("scroll", onScroll);
      unsubCart();
      unsubWishlist();
    };
  }, []);

  const onEnter = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(id);
  };
  const onLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const pathname = usePathname();
  const activeCat  = categories.find((c) => c.id === activeDropdown);
  const hasMega    = activeCat?.megaMenu && activeCat.megaMenu.length > 0;

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 bg-white z-[888] transition-all duration-300 ${
          isScrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.09)]" : "shadow-[0_1px_0_#ebebeb]"
        }`}
        onMouseLeave={onLeave}
      >
        {/* ── Ana çubuk ── */}
        <div className="container-site grid grid-cols-3 items-center h-[68px]">

          {/* Sol — mobil hamburger + hesap */}
          <div className="flex items-center">
            <button
              className="p-2 text-[#111] lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
            >
              {mobileOpen ? <XIcon size={19} /> : <MenuIcon size={19} />}
            </button>
            <Link
              href={initialUser ? "/hesabim" : "/giris"}
              className="p-2 text-[#111] hover:opacity-50 transition-opacity lg:hidden"
              aria-label={initialUser ? "Hesabım" : "Giriş Yap"}
            >
              <UserIcon size={19} />
            </Link>
          </div>

          {/* Orta — Lüks Butik Logo */}
          <div className="flex justify-center">
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex flex-col items-center leading-none group"
            >
              {/* Dünyanın Çiçeği — Cormorant Garamond */}
              <span
                className="font-cormorant font-light text-[#1a2e2f] uppercase tracking-[0.10em] text-[18px] sm:text-[21px] group-hover:opacity-70 transition-opacity duration-200 whitespace-nowrap"
              >
                Dünyanın Çiçeği
              </span>

              {/* Ayraç + alt yazı */}
              <div className="flex items-center gap-[6px] mt-[4px]">
                <span className="block w-[18px] h-[0.5px] bg-slate-400 opacity-60" />
                <span className="text-[7.5px] tracking-[0.3em] uppercase text-slate-400 font-sans font-normal whitespace-nowrap">
                  ÇİÇEKÇİLİK &amp; ORGANİZASYON
                </span>
                <span className="block w-[18px] h-[0.5px] bg-slate-400 opacity-60" />
              </div>
            </Link>
          </div>

          {/* Sağ — ikonlar */}
          <div className="flex items-center justify-end gap-[2px]">

            {/* Arama */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#111] hover:opacity-50 transition-opacity"
              aria-label="Ara"
            >
              <SearchIcon size={19} />
            </button>

            {/* Kargo takip — sadece desktop */}
            <Link
              href="/siparis-takip"
              className="p-2 text-[#111] hover:opacity-50 transition-opacity hidden lg:flex"
              aria-label="Sipariş Takip"
            >
              <TruckIcon size={19} />
            </Link>

            {/* Hesabım — sadece desktop */}
            <UserMenu initialUser={initialUser} />

            {/* Favoriler — sadece desktop */}
            <Link
              href="/favoriler"
              className="p-2 text-[#111] hover:opacity-50 transition-opacity hidden lg:flex relative"
              aria-label="Favoriler"
            >
              <HeartIcon size={19} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1 text-[8px] font-semibold text-[#111] leading-none">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Sepet */}
            <Link
              href="/sepet"
              className="p-2 text-[#111] hover:opacity-50 transition-opacity relative hidden lg:flex"
              aria-label="Sepet"
            >
              <CartIcon size={19} />
              <span className="absolute top-1.5 right-1 text-[8px] font-semibold text-[#111] leading-none">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            </Link>

            {/* Mobil sepet */}
            <Link
              href="/sepet"
              className="p-2 text-[#111] hover:opacity-50 transition-opacity relative lg:hidden"
              aria-label="Sepet"
            >
              <CartIcon size={19} />
              <span className="absolute top-1.5 right-1 text-[8px] font-semibold text-[#111] leading-none">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            </Link>

          </div>
        </div>

        {/* ── Navigasyon çubuğu — desktop ── */}
        <nav className="hidden lg:block border-t border-[#ebebeb] relative">
          <div className="container-site flex items-center">
            <ul className="flex items-center justify-center flex-1">
              {categories.map((cat) => (
                <NavItem
                  key={cat.id}
                  cat={cat}
                  isOpen={activeDropdown === cat.id}
                  onEnter={onEnter}
                />
              ))}
            </ul>
            {/* Ribbon stilinde sağ kenar çizgisi */}
            <span className="ml-4 text-[#ccc] text-lg leading-none select-none pr-1">—</span>
          </div>

          {/* Mega menu */}
          {hasMega && activeCat && (
            <div
              className="absolute left-0 right-0 top-full bg-white z-[900] border-t border-[#ebebeb]"
              style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.07)" }}
              onMouseEnter={() => onEnter(activeCat.id)}
            >
              <div className="container-site py-8">
                <div className="flex gap-14">
                  {activeCat.megaMenu!.map((col) => (
                    <div key={col.heading} className="min-w-[180px]">
                      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#0d0d0d] uppercase mb-4 pb-2 border-b border-[#ebebeb]">
                        {col.heading}
                      </p>
                      <ul className="space-y-2.5">
                        {col.items.map((item) => (
                          <li key={item.slug}>
                            <Link
                              href={`/${activeCat.slug}/${item.slug}`}
                              className="text-[12px] text-[#555] hover:text-[#0d0d0d] transition-colors leading-relaxed tracking-wide block"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ── Mobil menü ── */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-[#ebebeb] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-5">
                <Link
                  href="/favoriler"
                  className="flex items-center gap-2 text-[12px] text-[#555] hover:text-[#0d0d0d] tracking-wider uppercase"
                  onClick={() => setMobileOpen(false)}
                >
                  <HeartIcon size={17} /> <span>Favoriler</span>
                </Link>
                <Link
                  href="/siparis-takip"
                  className="flex items-center gap-2 text-[12px] text-[#555] hover:text-[#0d0d0d] tracking-wider uppercase"
                  onClick={() => setMobileOpen(false)}
                >
                  <TruckIcon size={17} /> <span>Sipariş Takip</span>
                </Link>
              </div>
            </div>
            <ul className="divide-y divide-[#f0f0f0]">
              {categories.map((cat) => {
                const items = cat.megaMenu
                  ? cat.megaMenu.flatMap((col) => col.items)
                  : (cat.subCategories ?? []);
                return (
                  <li key={cat.id}>
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/${cat.slug}`}
                        className="flex-1 px-5 py-3.5 text-[11px] font-normal text-[#0d0d0d] uppercase tracking-[0.12em]"
                        onClick={() => setMobileOpen(false)}
                      >
                        {cat.name}
                      </Link>
                      {items.length > 0 && (
                        <button
                          className="px-4 py-3.5 text-[#aaa]"
                          onClick={() => setMobileSub(mobileSub === cat.id ? null : cat.id)}
                        >
                          <ChevronDownIcon
                            size={12}
                            className={`transition-transform ${mobileSub === cat.id ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                    {mobileSub === cat.id && items.length > 0 && (
                      <ul className="bg-[#fafafa] pl-5 pb-2">
                        {items.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={`/${cat.slug}/${sub.slug}`}
                              className="block py-2.5 px-5 text-[11px] text-[#666] hover:text-[#0d0d0d] tracking-wider"
                              onClick={() => setMobileOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </header>

      {/* Mega menu overlay */}
      {hasMega && (
        <div
          className="fixed inset-0 bg-black/10 z-[887]"
          onMouseEnter={() => setActiveDropdown(null)}
        />
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

/* ── Nav kalemi ─────────────────────────────────────────────────────────── */
function NavItem({
  cat,
  isOpen,
  onEnter,
}: {
  cat: Category;
  isOpen: boolean;
  onEnter: (id: string) => void;
}) {
  const hasDropdown =
    (cat.megaMenu && cat.megaMenu.length > 0) ||
    (cat.subCategories && cat.subCategories.length > 0);

  return (
    <li className="relative" onMouseEnter={() => hasDropdown && onEnter(cat.id)}>
      <Link
        href={`/${cat.slug}`}
        className={`
          flex items-center px-4 py-[15px]
          text-[11px] font-normal uppercase tracking-[0.1em]
          transition-opacity duration-150 whitespace-nowrap
          relative group
          ${isOpen ? "text-[#0d0d0d]" : "text-[#0d0d0d] hover:opacity-50"}
        `}
      >
        {cat.name}
        {/* Alttan ince çizgi hover efekti */}
        <span className="absolute bottom-0 left-4 right-4 h-[1px] bg-[#0d0d0d] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
      </Link>
    </li>
  );
}
