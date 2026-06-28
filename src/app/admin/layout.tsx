"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_PASSWORD = "best2024";

const navGroups = [
  {
    label: "Genel",
    links: [
      {
        href: "/admin",
        label: "Dashboard",
        exact: true,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Katalog",
    links: [
      {
        href: "/admin/urunler",
        label: "Ürünler",
        exact: false,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
      {
        href: "/admin/kategoriler",
        label: "Kategoriler",
        exact: false,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Satış",
    links: [
      {
        href: "/admin/siparisler",
        label: "Siparişler",
        exact: false,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        href: "/admin/musteriler",
        label: "Müşteriler",
        exact: false,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Pazarlama",
    links: [
      {
        href: "/admin/kampanyalar",
        label: "Kampanyalar",
        exact: false,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Sistem",
    links: [
      {
        href: "/admin/ayarlar",
        label: "Ayarlar",
        exact: false,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ],
  },
];

function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem("admin_auth", "1");
      onAuth();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d3435] to-[#2a4a4b] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1d3435] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-heading text-xl font-semibold text-[#1d3435]">Best Çiçekçilik</h1>
          <p className="text-[12px] text-[#999] mt-1 uppercase tracking-widest">Yönetim Paneli</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1.5">Şifre</label>
            <input type="password" value={pw}
              onChange={(e) => { setPw(e.target.value); setError(false); }}
              className="w-full border border-[#e8e8e8] rounded-md px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/20 transition-all"
              placeholder="••••••••" autoFocus />
            {error && <p className="text-red-500 text-[12px] mt-1.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              Şifre hatalı.
            </p>}
          </div>
          <button type="submit" className="btn-primary w-full py-2.5 rounded-md">Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setAuthed(localStorage.getItem("admin_auth") === "1");
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />;

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setAuthed(false);
  };

  const currentLabel = navGroups
    .flatMap((g) => g.links)
    .find((l) => (l.exact ? pathname === l.href : pathname.startsWith(l.href)))?.label ?? "Yönetim";

  return (
    <div className="min-h-screen bg-[#f5f4f1] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-[#1d3435] z-50 flex flex-col transform transition-transform duration-200 lg:translate-x-0 lg:relative lg:flex-shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
          <span className="font-heading text-[15px] font-semibold text-white block">Best Çiçekçilik</span>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Admin Panel v2.0</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30 px-3 mb-2">{group.label}</p>
              {group.links.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                return (
                  <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium mb-0.5 transition-all ${
                      isActive ? "bg-[#3d7b74] text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}>
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-white/10 flex-shrink-0 space-y-0.5">
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/50 hover:text-white rounded-md hover:bg-white/10 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Siteyi Gör
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-white/50 hover:text-red-400 rounded-md hover:bg-white/10 transition-all w-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#ebebeb] px-5 py-3.5 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
          <button className="lg:hidden text-[#545454] hover:text-[#1d3435] p-1" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 text-[13px] text-[#999]">
            <span>Admin</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-semibold text-[#1d3435]">{currentLabel}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#3d7b74] bg-[#3d7b74]/10 px-2.5 py-1 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 bg-[#3d7b74] rounded-full animate-pulse" />
              Canlı
            </span>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-7 max-w-[1400px] w-full">{children}</main>
      </div>
    </div>
  );
}
