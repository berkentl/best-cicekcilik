"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import type { Product, FilterCategory } from "@/types";
import { matchProduct, DEFAULT_FILTER_CATEGORIES } from "@/lib/filterService";

const SORT_OPTIONS = [
  { value: "recommended", label: "Önerilen Sıralama" },
  { value: "price_asc",   label: "Fiyat: Düşükten Yükseğe" },
  { value: "price_desc",  label: "Fiyat: Yüksekten Düşüğe" },
  { value: "newest",      label: "En Yeni" },
  { value: "bestseller",  label: "En Çok Satan" },
];

/* ── Icons ──────────────────────────────────────────────────────── */
function IconFilter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/>
      <line x1="11" y1="18" x2="13" y2="18"/>
    </svg>
  );
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={cn("transition-transform duration-300 flex-shrink-0", open && "rotate-180")}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function IconTruck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

/* ── Accordion ──────────────────────────────────────────────────── */
function FilterAccordion({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#efefef]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group">
        <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#1b1c1c]">{title}</span>
        <IconChevron open={open} />
      </button>
      <div className={cn("overflow-hidden transition-all duration-300", open ? "max-h-[400px] pb-4" : "max-h-0")}>
        <div className="overflow-y-auto max-h-[340px] pr-1 space-y-1 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Custom Radio Checkbox ──────────────────────────────────────── */
function FilterOptionItem({ label, count, checked, onChange }: {
  label: string; count?: number; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer group">
      <span className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200",
        checked ? "border-[#163426] bg-[#163426]" : "border-[#d0d0d0] group-hover:border-[#163426]/50"
      )}>
        {checked && <span className="w-2 h-2 rounded-full bg-white block"/>}
      </span>
      <span className={cn(
        "text-[13px] transition-colors duration-200 leading-snug flex-1",
        checked ? "text-[#163426] font-semibold" : "text-[#424844] group-hover:text-[#163426]"
      )}>
        {label}
      </span>
      {count !== undefined && (
        <span className={cn(
          "text-[11px] tabular-nums flex-shrink-0",
          checked ? "text-[#163426]/60" : "text-[#bbb]"
        )}>
          {count}
        </span>
      )}
    </label>
  );
}

/* ── Filter Sidebar Content (shared: desktop + mobile) ──────────── */
interface SidebarProps {
  filterCategories: FilterCategory[];
  selectedFilters: Record<string, string[]>;
  onToggle: (categoryId: string, value: string) => void;
  priceMin: string;
  priceMax: string;
  onPriceChange: (field: "priceMin" | "priceMax", value: string) => void;
  onApplyPrice: () => void;
  onReset: () => void;
  activeCount: number;
}

function FilterSidebarContent({
  filterCategories, selectedFilters, onToggle,
  priceMin, priceMax, onPriceChange, onApplyPrice, onReset, activeCount,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[13px] font-semibold text-[#1b1c1c]">Filtreler</span>
        {activeCount > 0 && (
          <button onClick={onReset}
            className="text-[12px] text-[#163426] font-semibold underline underline-offset-2 hover:text-[#0d2219] transition-colors">
            Temizle ({activeCount})
          </button>
        )}
      </div>

      {/* Dinamik filtre kategorileri */}
      {filterCategories.map(category => (
        <FilterAccordion
          key={category.id}
          title={category.label}
          defaultOpen={category.defaultOpen ?? false}
        >
          {category.options.map(opt => (
            <FilterOptionItem
              key={opt.value}
              label={opt.label}
              count={opt.count}
              checked={(selectedFilters[category.id] ?? []).includes(opt.value)}
              onChange={() => onToggle(category.id, opt.value)}
            />
          ))}
        </FilterAccordion>
      ))}

      {/* Fiyat filtresi */}
      <div className="pt-4 pb-2">
        <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#1b1c1c] mb-4">Fiyat</p>
        <div className="flex items-center gap-2">
          <input
            type="number" placeholder="En az" value={priceMin}
            onChange={e => onPriceChange("priceMin", e.target.value)}
            className="w-full border border-[#e4e2e2] rounded-xl px-3 py-2.5 text-[13px] text-[#1b1c1c] placeholder:text-[#bbb] focus:outline-none focus:border-[#163426] focus:ring-2 focus:ring-[#163426]/10 transition-all"
          />
          <span className="text-[#bbb] text-sm flex-shrink-0">–</span>
          <input
            type="number" placeholder="En fazla" value={priceMax}
            onChange={e => onPriceChange("priceMax", e.target.value)}
            className="w-full border border-[#e4e2e2] rounded-xl px-3 py-2.5 text-[13px] text-[#1b1c1c] placeholder:text-[#bbb] focus:outline-none focus:border-[#163426] focus:ring-2 focus:ring-[#163426]/10 transition-all"
          />
        </div>
        <button onClick={onApplyPrice}
          className="mt-4 w-full bg-[#163426] hover:bg-[#1e4434] text-white font-semibold text-[14px] rounded-2xl py-3.5 transition-all duration-200 active:scale-[0.98]">
          Uygula
        </button>
      </div>
    </div>
  );
}

/* ── Main CategoryLayout ────────────────────────────────────────── */
export interface CategoryLayoutProps {
  products: Product[];
  /**
   * Filtre kategorileri — opsiyonel.
   * Verilmezse DEFAULT_FILTER_CATEGORIES kullanılır.
   * Kategori sayfasından buildFilterCategories() ile count'lu hali geçilebilir.
   */
  filterCategories?: FilterCategory[];
}

export function CategoryLayout({ products, filterCategories = DEFAULT_FILTER_CATEGORIES }: CategoryLayoutProps) {
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [sortKey, setSortKey]             = useState("recommended");
  const [sortOpen, setSortOpen]           = useState(false);
  const [showSidebar, setShowSidebar]     = useState(true);

  /* Seçili filtreler: { [categoryId]: string[] }
     Örnek: { "dizayn": ["Buket"], "renk": ["Kırmızı", "Pembe"] } */
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  /* Fiyat filtresi ayrı tutulur (Uygula butonuna basılana kadar uygulanmaz) */
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [appliedPriceMin, setAppliedPriceMin] = useState<number | null>(null);
  const [appliedPriceMax, setAppliedPriceMax] = useState<number | null>(null);

  /* Mobil drawer kapanınca body scroll kilidi kaldır */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!sortOpen) return;
    const handler = () => setSortOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [sortOpen]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  /* Bir filtre seçeneğini aç/kapat */
  const toggleFilter = useCallback((categoryId: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[categoryId] ?? [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [categoryId]: next };
    });
  }, []);

  const handlePriceChange = useCallback((field: "priceMin" | "priceMax", value: string) => {
    if (field === "priceMin") setPriceMin(value);
    else setPriceMax(value);
  }, []);

  const handleApplyPrice = useCallback(() => {
    setAppliedPriceMin(priceMin ? Number(priceMin) : null);
    setAppliedPriceMax(priceMax ? Number(priceMax) : null);
    setSidebarOpen(false);
  }, [priceMin, priceMax]);

  const handleReset = useCallback(() => {
    setSelectedFilters({});
    setPriceMin(""); setPriceMax("");
    setAppliedPriceMin(null); setAppliedPriceMax(null);
  }, []);

  /* Toplam aktif filtre sayısı (badge için) */
  const activeCount = useMemo(() => {
    const checkboxCount = Object.values(selectedFilters).reduce((s, arr) => s + arr.length, 0);
    const priceCount    = (appliedPriceMin !== null ? 1 : 0) + (appliedPriceMax !== null ? 1 : 0);
    return checkboxCount + priceCount;
  }, [selectedFilters, appliedPriceMin, appliedPriceMax]);

  /* Filtre + sıralama uygulanmış ürün listesi */
  const displayed = useMemo(() => {
    let list = products.filter(p => {
      // Fiyat filtresi
      const price = p.salePrice ?? p.price;
      if (appliedPriceMin !== null && price < appliedPriceMin) return false;
      if (appliedPriceMax !== null && price > appliedPriceMax) return false;
      // Checkbox filtreleri (filterService.matchProduct)
      return matchProduct(p, selectedFilters, filterCategories);
    });

    switch (sortKey) {
      case "price_asc":  list = [...list].sort((a,b) => (a.salePrice??a.price) - (b.salePrice??b.price)); break;
      case "price_desc": list = [...list].sort((a,b) => (b.salePrice??b.price) - (a.salePrice??a.price)); break;
      case "newest":     list = [...list].sort((a,b) => (b.isNew ? 1:0) - (a.isNew ? 1:0));              break;
      case "bestseller": list = [...list].sort((a,b) => (b.isBestseller ? 1:0) - (a.isBestseller ? 1:0)); break;
    }
    return list;
  }, [products, selectedFilters, filterCategories, sortKey, appliedPriceMin, appliedPriceMax]);

  const sortLabel = SORT_OPTIONS.find(o => o.value === sortKey)?.label ?? "Önerilen Sıralama";

  const sidebarProps: SidebarProps = {
    filterCategories, selectedFilters, onToggle: toggleFilter,
    priceMin, priceMax, onPriceChange: handlePriceChange,
    onApplyPrice: handleApplyPrice, onReset: handleReset, activeCount,
  };

  return (
    <>
      {/* ── Action & Trust Bar ────────────────────────────────── */}
      <div className="border-b border-[#efefef] bg-white sticky top-[56px] z-30 shadow-sm">
        <div className="container-site">
          <div className="flex items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidebar(v => !v)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e4e2e2] bg-white hover:border-[#163426] hover:text-[#163426] text-[#424844] text-[13px] font-semibold transition-all duration-200">
                <IconFilter />
                {showSidebar ? "Filtreyi Gizle" : "Filtreyi Göster"}
                {activeCount > 0 && (
                  <span className="ml-0.5 w-5 h-5 rounded-full bg-[#163426] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e4e2e2] bg-white text-[#424844] text-[13px] font-semibold active:bg-[#f5f5f5]">
                <IconFilter />
                Filtrele
                {activeCount > 0 && (
                  <span className="ml-0.5 w-5 h-5 rounded-full bg-[#163426] text-white text-[10px] font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>
              <span className="text-[12px] text-[#aaa] hidden sm:inline">{displayed.length} ürün</span>
            </div>

            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setSortOpen(v => !v); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-semibold transition-all duration-200",
                  sortOpen
                    ? "border-[#163426] text-[#163426] bg-[#f0f5f0]"
                    : "border-[#e4e2e2] text-[#424844] bg-white hover:border-[#163426] hover:text-[#163426]"
                )}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
                <span className="hidden sm:inline">Sırala&nbsp;:&nbsp;</span>{sortLabel}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={cn("transition-transform duration-200", sortOpen && "rotate-180")}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-56 bg-white border border-[#e8e8e8] rounded-xl shadow-md overflow-hidden z-50">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={e => { e.stopPropagation(); setSortKey(opt.value); setSortOpen(false); }}
                      className={cn(
                        "w-full text-left px-4 py-3 text-[13px] transition-colors duration-100",
                        sortKey === opt.value ? "bg-[#f0f5f0] text-[#163426] font-semibold" : "text-[#424844] hover:bg-[#f9faf9]"
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 py-2.5 border-t border-[#f5f5f5] overflow-x-auto scrollbar-none">
            {[
              { icon: <IconTruck />, label: "Her Gün Aynı Gün Teslimat" },
              { icon: <IconShield />, label: "Güvenli Alışveriş" },
              { icon: <IconStar />, label: "Yüksek Müşteri Memnuniyeti" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#163426] flex items-center justify-center text-white flex-shrink-0">
                  {icon}
                </div>
                <span className="text-[12px] text-[#424844] font-medium whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main: sidebar + grid ──────────────────────────────── */}
      <div className="container-site py-8 md:py-10">
        <div className={cn(
          "flex gap-8 items-start",
          showSidebar ? "lg:grid lg:grid-cols-[240px_1fr]" : ""
        )}>
          {showSidebar && (
            <aside className="hidden lg:block w-[240px] flex-shrink-0 bg-white rounded-2xl border border-[#efefef] shadow-sm px-5 py-4 sticky top-[140px]">
              <FilterSidebarContent {...sidebarProps} />
            </aside>
          )}

          <div className="flex-1 min-w-0">
            {displayed.length > 0 ? (
              <div className={cn(
                "grid gap-4 md:gap-5",
                showSidebar
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              )}>
                {displayed.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-[#f5f3f3] flex items-center justify-center mx-auto mb-4">
                  <IconFilter />
                </div>
                <p className="text-[#999] text-[15px] mb-2">Bu filtrelere uygun ürün bulunamadı.</p>
                <button onClick={handleReset}
                  className="text-[13px] text-[#163426] font-semibold underline underline-offset-2 hover:text-[#0d2219] transition-colors">
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────── */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden transition-opacity duration-300",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-3xl shadow-2xl transition-transform duration-400 ease-out",
        sidebarOpen ? "translate-y-0" : "translate-y-full"
      )} style={{ maxHeight: "88vh" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#ddd]"/>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0f0]">
          <span className="text-[15px] font-bold text-[#1b1c1c]">Filtreler</span>
          <button onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#424844] hover:bg-[#ebebeb] transition-colors">
            <IconX />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(88vh - 90px)" }}>
          <FilterSidebarContent {...sidebarProps} />
        </div>
      </div>
    </>
  );
}
