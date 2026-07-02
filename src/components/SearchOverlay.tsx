"use client";

import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { useCurrencyStore } from "@/store/currencyStore";
import { formatPrice } from "@/lib/currency";

const PLACEHOLDER = "/images/urunler/urun-1a.jpg";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const currency = useCurrencyStore((s) => s.currency);
  const rates    = useCurrencyStore((s) => s.rates);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      startTransition(() => { setQuery(""); setResults([]); });
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Klavye ile kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const search = useCallback((q: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?active=false`);
        if (res.ok) {
          const all: Product[] = await res.json();
          const lower = q.toLowerCase();
          setResults(
            all
              .filter(
                (p) =>
                  p.isActive !== false &&
                  (p.name.toLowerCase().includes(lower) ||
                    (p.category ?? "").toLowerCase().includes(lower) ||
                    (p.description ?? "").toLowerCase().includes(lower))
              )
              .slice(0, 8)
          );
        }
      } catch {}
      setLoading(false);
    }, 300);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full shadow-xl">
        {/* Arama kutusu */}
        <div className="container-site flex items-center gap-3 h-16 border-b border-[#f0f0f0]">
          <svg className="w-5 h-5 text-[#999] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
            placeholder="Ürün, kategori ara..."
            className="flex-1 text-[15px] text-[#1d3435] placeholder:text-[#bbb] focus:outline-none bg-transparent"
          />
          {loading && (
            <svg className="w-4 h-4 animate-spin text-[#3d7b74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          <button onClick={onClose} className="text-[#999] hover:text-[#1d3435] transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sonuçlar */}
        {results.length > 0 && (
          <div className="container-site py-4 max-h-[60vh] overflow-y-auto">
            <p className="text-[11px] text-[#999] uppercase tracking-widest font-semibold mb-3">
              {results.length} sonuç
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/urun/${p.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2.5 rounded-md hover:bg-[#f9f8f6] transition-colors"
                >
                  <div className="relative w-12 h-14 flex-shrink-0 rounded overflow-hidden bg-[#f0ede9]">
                    <Image
                      src={p.images[0] ?? PLACEHOLDER}
                      alt={p.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#3d7b74] uppercase tracking-widest font-medium truncate">
                      {p.category}
                    </p>
                    <p className="text-[13px] font-semibold text-[#1d3435] leading-snug truncate">
                      {p.name}
                    </p>
                    <p className="text-[13px] font-bold text-[#1d3435] mt-0.5">
                      {formatPrice(p.salePrice ?? p.price, currency, rates)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {query.trim() && !loading && results.length === 0 && (
          <div className="container-site py-8 text-center text-[#999] text-[13px]">
            &quot;{query}&quot; için sonuç bulunamadı.
          </div>
        )}

        {!query.trim() && (
          <div className="container-site py-5">
            <p className="text-[11px] text-[#999] uppercase tracking-widest font-semibold mb-3">Popüler Kategoriler</p>
            <div className="flex flex-wrap gap-2">
              {["Güller", "Lale Buketi", "Orkide", "Doğum Günü"].map((cat) => (
                <Link
                  key={cat}
                  href={`/cicek`}
                  onClick={onClose}
                  className="px-3 py-1.5 text-[12px] border border-[#e8e8e8] rounded-full text-[#545454] hover:border-[#1d3435] hover:text-[#1d3435] transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
