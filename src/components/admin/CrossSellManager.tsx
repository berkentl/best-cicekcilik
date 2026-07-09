"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
}

const MAX_PRODUCTS = 3;
const PLACEHOLDER = "/images/urunler/urun-1a.jpg";

export function CrossSellManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [query, setQuery] = useState("");

  const [active, setActive] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?list=1").then((r) => r.json()),
      fetch("/api/cross-sell").then((r) => r.json()),
    ])
      .then(([productList, crossSell]: [AdminProduct[], { active: boolean; title: string; products: AdminProduct[] }]) => {
        setProducts(productList);
        setActive(crossSell.active);
        setTitle(crossSell.title || "");
        setSelectedIds(crossSell.products.map((p) => p.id));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const selectedProducts = useMemo(
    () => selectedIds.map((id) => products.find((p) => p.id === id)).filter((p): p is AdminProduct => Boolean(p)),
    [selectedIds, products]
  );

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_PRODUCTS) return prev;
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/cross-sell", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active, title, productIds: selectedIds }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#ebebeb] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-xl font-medium text-[#1d3435]">Çapraz Satış Yönetimi</h2>
          <span className="text-[10px] font-bold bg-[#3d7b74]/10 text-[#3d7b74] px-2 py-0.5 rounded-full uppercase tracking-wide">
            Sepet Sayfası
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActive((v) => !v)}
          className={`relative inline-flex items-center w-11 rounded-full transition-colors flex-shrink-0 ${
            active ? "bg-[#3d7b74]" : "bg-[#e0e0e0]"
          }`}
          style={{ height: "24px" }}
        >
          <span
            className={`absolute bg-white rounded-full shadow transition-all ${active ? "left-6" : "left-1"}`}
            style={{ width: "16px", height: "16px" }}
          />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <p className="text-[12px] text-[#999] -mt-1">
          Müşteri sepette &quot;Siparişi Tamamla&quot;ya bastığında, ödemeye geçmeden önce burada seçtiğiniz
          ürünleri öneren zarif bir pop-up gösterilir. Kapalıyken müşteri doğrudan ödemeye yönlendirilir.
        </p>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1d3435] mb-1.5">
            Pop-up Başlığı
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Daha Önceki Müşteriler Bunu da Beğendi"
            className="w-full border border-[#e8e8e8] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/10 transition-all bg-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1d3435]">
              Çapraz Satış Ürünleri
            </label>
            <span className="text-[11px] text-[#999]">{selectedIds.length}/{MAX_PRODUCTS} seçildi</span>
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedProducts.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 bg-[#f5f9f8] text-[#1d3435] text-[12px] font-medium pl-2.5 pr-1.5 py-1 rounded-full border border-[#3d7b74]/20"
                >
                  {p.name}
                  <button
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className="w-4 h-4 rounded-full bg-[#1d3435]/10 hover:bg-[#1d3435]/20 flex items-center justify-center text-[10px] transition-colors"
                    aria-label={`${p.name} kaldır`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full border border-[#e8e8e8] rounded-md px-3 py-2 text-[13px] mb-2 focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/10 transition-all bg-white"
          />

          <div className="border border-[#f0f0f0] rounded-lg max-h-[280px] overflow-y-auto divide-y divide-[#f5f5f5]">
            {loading ? (
              <p className="text-center text-[13px] text-[#999] py-8">Yükleniyor...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-[13px] text-[#999] py-8">Ürün bulunamadı.</p>
            ) : (
              filtered.map((p) => {
                const checked = selectedIds.includes(p.id);
                const disabled = !checked && selectedIds.length >= MAX_PRODUCTS;
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                      disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-[#fafafa]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleProduct(p.id)}
                      className="w-4 h-4 rounded border-[#e8e8e8] text-[#3d7b74] focus:ring-[#3d7b74]/20 flex-shrink-0"
                    />
                    <div className="relative w-9 h-9 rounded-md overflow-hidden bg-[#f5f5f5] flex-shrink-0">
                      <Image src={p.images?.[0] ?? PLACEHOLDER} alt={p.name} fill unoptimized className="object-cover" sizes="36px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[#1d3435] truncate">{p.name}</p>
                      <p className="text-[11px] text-[#999]">{p.category}</p>
                    </div>
                    <p className="text-[13px] font-semibold text-[#3d7b74] flex-shrink-0">
                      ₺{(p.salePrice ?? p.price).toLocaleString("tr-TR")}
                    </p>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-[#1d3435] text-white rounded-md text-[13px] font-bold hover:bg-[#2a4a4b] transition-colors disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {saved && <span className="text-[12.5px] font-semibold text-[#3d7b74]">✓ Kaydedildi</span>}
        </div>
      </div>
    </div>
  );
}
