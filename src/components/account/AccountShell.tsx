"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  PackageIcon,
  MapPinIcon,
  HeartIcon,
  UserIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "@/components/icons";
import type { CustomerUser } from "@/types";

const NAV_ITEMS = [
  { href: "/hesabim", label: "Genel", icon: HomeIcon },
  { href: "/hesabim/siparislerim", label: "Siparişlerim", icon: PackageIcon },
  { href: "/hesabim/adreslerim", label: "Adreslerim", icon: MapPinIcon },
  { href: "/hesabim/favorilerim", label: "Favorilerim", icon: HeartIcon },
  { href: "/hesabim/hesap-bilgilerim", label: "Hesap Bilgilerim", icon: UserIcon },
];

export function AccountShell({ user, children }: { user: CustomerUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || user.email[0]?.toUpperCase();

  return (
    <div className="bg-[#faf8f5] min-h-[70vh]">
      <div className="container-site py-8 md:py-12">
        {/* Üst — kullanıcı kartı + mobil menü tetikleyici */}
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#1d3435] text-white flex items-center justify-center font-semibold text-[15px] flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-poppins text-lg md:text-xl font-semibold text-[#1d3435] leading-tight">
                {user.name || "Hesabım"}
              </p>
              <p className="text-[12.5px] text-[#8a9c9c]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="lg:hidden p-2 text-[#1d3435] border border-[#e2ddd8] rounded-lg"
            aria-label="Menü"
          >
            {mobileNavOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0">
            <SidebarNav pathname={pathname} onNavigate={() => {}} />
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-medium text-[#b0685f] hover:bg-[#fdf2f0] transition-colors disabled:opacity-60"
            >
              <LogOutIcon size={17} />
              {loggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
            </button>
          </aside>

          {/* Sidebar — mobil (açılır panel) */}
          <AnimatePresence>
            {mobileNavOpen && (
              <motion.aside
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="lg:hidden overflow-hidden -mt-2"
              >
                <SidebarNav pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-medium text-[#b0685f] hover:bg-[#fdf2f0] transition-colors disabled:opacity-60"
                >
                  <LogOutIcon size={17} />
                  {loggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
                </button>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* İçerik */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <nav className="bg-white rounded-2xl border border-[#ede8e3] p-2.5 space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-medium transition-colors ${
              isActive ? "" : "hover:bg-[#f7f4f0]"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="account-nav-active"
                className="absolute inset-0 bg-[#1d3435] rounded-xl"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-3 ${isActive ? "text-white" : "text-[#545454]"}`}>
              <Icon size={17} />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
