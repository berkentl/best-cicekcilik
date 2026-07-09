"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  HomeIcon,
  PackageIcon,
  MapPinIcon,
  HeartIcon,
  LogOutIcon,
} from "@/components/icons";
import type { CustomerUser } from "@/types";

const MENU_ITEMS = [
  { href: "/hesabim", label: "Genel", icon: HomeIcon },
  { href: "/hesabim/siparislerim", label: "Siparişlerim", icon: PackageIcon },
  { href: "/hesabim/adreslerim", label: "Adreslerim", icon: MapPinIcon },
  { href: "/hesabim/favorilerim", label: "Favorilerim", icon: HeartIcon },
];

export function UserMenu({ initialUser }: { initialUser: CustomerUser | null }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!initialUser) {
    return (
      <Link
        href="/giris"
        className="p-2 text-[#111] hover:opacity-50 transition-opacity hidden lg:flex"
        aria-label="Giriş Yap"
      >
        <UserIcon size={19} />
      </Link>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const firstName = initialUser.name?.split(" ")[0] || "Hesabım";

  return (
    <div className="relative hidden lg:block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 text-[#111] hover:opacity-50 transition-opacity flex items-center gap-1.5"
        aria-label="Hesabım"
      >
        <UserIcon size={19} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-[#ebebeb] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] z-[950] overflow-hidden"
          >
            <div className="px-4 py-3.5 border-b border-[#f0f0f0]">
              <p className="text-[13px] font-semibold text-[#1d3435] truncate">{firstName}</p>
              <p className="text-[11.5px] text-[#999] truncate">{initialUser.email}</p>
            </div>
            <div className="py-1.5">
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#3f4a4a] hover:bg-[#faf8f5] hover:text-[#1d3435] transition-colors"
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-[#f0f0f0] py-1.5">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#b0685f] hover:bg-[#fdf2f0] transition-colors disabled:opacity-60"
              >
                <LogOutIcon size={16} />
                {loggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
