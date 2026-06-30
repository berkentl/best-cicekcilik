"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product, Category } from "@/types";
import { navCategories } from "@/lib/data";

const inputClass =
  "w-full border border-[#e8e8e8] rounded-sm px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] transition-colors bg-white";
const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1.5";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  careInstructions: "",
  extraCategorySlugs: [] as { categorySlug: string; subCategorySlug?: string }[],
  price: "" as string | number,
  salePrice: "" as string | number,
  category: "",
  categorySlug: "",
  categoryId: "",
  subCategory: "",
  subCategorySlug: "",
  images: ["", ""],
  stock: "" as string | number,
  isActive: true,
  isNew: false,
  isBestseller: false,
  isPinnedToVitrin: false,
};

type FormState = typeof emptyForm;

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-[#3d7b74]" : "bg-[#d0cdc8]"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      <span className="text-[13px] text-[#545454]">{label}</span>
    </label>
  );
}

function ImageUploadField({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) onChange(json.url);
      else setError(json.error ?? "Yükleme başarısız");
    } catch {
      setError("Yükleme hatası");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex gap-2 items-start">
        {value && (
          <div className="relative w-14 h-16 flex-shrink-0 rounded-sm overflow-hidden bg-[#f0ede9] border border-[#e8e8e8]">
            <Image src={value} alt="önizleme" fill unoptimized className="object-cover" sizes="56px" />
          </div>
        )}
        <div className="flex-1 space-y-1.5">
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="https://... veya /images/..." className={inputClass} />
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="text-[11px] font-semibold px-3 py-1.5 border border-[#e8e8e8] rounded-sm text-[#545454] hover:border-[#3d7b74] hover:text-[#3d7b74] transition-colors disabled:opacity-50">
              {uploading ? "Yükleniyor..." : "📁 Bilgisayardan Seç"}
            </button>
            {error && <span className="text-[11px] text-red-500">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterSubCat, setFilterSubCat] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");


  const fetchAll = async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      fetch("/api/products?active=false&list=1"),
      fetch("/api/categories"),
    ]);
    if (pRes.ok) setProducts(await pRes.json());
    if (cRes.ok) {
      const dbCats: Category[] = await cRes.json();
      const merged = dbCats.map((cat) => {
        const staticCat = navCategories.find((c) => c.slug === cat.slug);
        return { ...cat, megaMenu: (cat.megaMenu && cat.megaMenu.length > 0) ? cat.megaMenu : (staticCat?.megaMenu ?? []) };
      });
      setCategories(merged);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Alt kategoriler — seçili ana kategoriye göre
  const selectedCatObj = categories.find((c) => c.slug === form.categorySlug);
  const subCategories = selectedCatObj?.megaMenu?.flatMap((col) => col.items) ?? [];

  // Filtre için alt kategoriler
  const filterCatObj = categories.find((c) => c.slug === filterCat);
  const filterSubCats = filterCatObj?.megaMenu?.flatMap((col) => col.items) ?? [];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.category ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || p.categorySlug === filterCat;
    const matchSubCat = filterSubCat === "all" || p.subCategorySlug === filterSubCat;
    return matchSearch && matchCat && matchSubCat;
  });

  const autoSlug = (name: string) =>
    name.toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const up = (key: keyof FormState, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setSaveError("");
    setModalOpen(true);
  };

  const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, slug: p.slug, description: stripHtml(p.description ?? ""), careInstructions: stripHtml(p.careInstructions ?? ""),
      extraCategorySlugs: p.extraCategorySlugs ?? [],
      price: p.price, salePrice: p.salePrice ?? "",
      category: p.category ?? "", categorySlug: p.categorySlug ?? "", categoryId: "",
      subCategory: p.subCategory ?? "", subCategorySlug: p.subCategorySlug ?? "",
      images: [p.images[0] ?? "", p.images[1] ?? ""],
      stock: p.stock ?? 0,
      isActive: p.isActive ?? true, isNew: p.isNew ?? false, isBestseller: p.isBestseller ?? false,
      isPinnedToVitrin: p.isPinnedToVitrin ?? false,
    });
    setSaveError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { setSaveError("Ürün adı ve fiyat zorunludur."); return; }
    setSaving(true);
    setSaveError("");
    const slug = form.slug || autoSlug(String(form.name));
    const parsePrice = (v: string | number) => {
      if (typeof v === "number") return v;
      // Türkçe format: 25.000,50 → 25000.50 | veya 25000 | veya 25,000
      const cleaned = String(v).trim()
        .replace(/\./g, "")   // binlik nokta kaldır
        .replace(",", ".");   // ondalık virgülü noktaya çevir
      return parseFloat(cleaned) || 0;
    };
    const payload = {
      ...form, slug,
      price: parsePrice(form.price),
      salePrice: form.salePrice !== "" ? parsePrice(form.salePrice) : undefined,
      stock: parseInt(String(form.stock).replace(/\D/g, "")) || 0,
      images: form.images.filter(Boolean),
    };
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Kayıt hatası"); }
      await fetchAll();
      setModalOpen(false);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await fetchAll();
    setDeleteId(null);
  };

  const toggleActive = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, isActive: !p.isActive }),
    });
    await fetchAll();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          <input type="text" placeholder="Ürün ara..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-[#e8e8e8] rounded-sm px-4 py-2 text-[13px] w-48 focus:outline-none focus:border-[#3d7b74] transition-colors" />
          <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setFilterSubCat("all"); }}
            className="border border-[#e8e8e8] rounded-sm px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] transition-colors">
            <option value="all">Tüm Kategoriler</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          {filterSubCats.length > 0 && (
            <select value={filterSubCat} onChange={(e) => setFilterSubCat(e.target.value)}
              className="border border-[#e8e8e8] rounded-sm px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] transition-colors">
              <option value="all">Tüm Alt Kategoriler</option>
              {filterSubCats.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          )}
        </div>
        <Link href="/admin/urunler/yeni" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Ürün
        </Link>
      </div>

      {/* ── Mobil Kart Görünümü (md altı) ── */}
      {!loading && (
        <div className="md:hidden space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white rounded-sm border border-[#f0f0f0] py-12 text-center text-[#999] text-[13px]">Ürün bulunamadı.</div>
          )}
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-sm border border-[#f0f0f0] p-4 flex gap-3">
              <div className="relative w-14 h-16 flex-shrink-0 rounded-sm overflow-hidden bg-[#f0ede9]">
                {p.images[0] && <Image src={p.images[0]} alt={p.name} fill unoptimized className="object-cover" sizes="56px" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1d3435] leading-tight">{p.name}</p>
                    <p className="text-[11px] text-[#999] mt-0.5">{p.category}</p>
                  </div>
                  <button onClick={() => toggleActive(p)} className="flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${p.isActive ? "bg-green-100 text-green-700" : "bg-[#f0f0f0] text-[#999]"}`}>
                      {p.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[13px] font-bold text-[#1d3435]">₺{(p.salePrice ?? p.price).toLocaleString("tr-TR")}</span>
                  <span className={`text-[11px] font-semibold ${(p.stock ?? 0) === 0 ? "text-red-500" : (p.stock ?? 0) < 5 ? "text-yellow-600" : "text-[#3d7b74]"}`}>
                    {p.stock ?? 0} adet
                  </span>
                  {p.isBestseller && <span className="text-[10px] bg-[#1d3435] text-white px-1.5 py-0.5 rounded-full">Best</span>}
                  {p.isNew && <span className="text-[10px] bg-[#3d7b74] text-white px-1.5 py-0.5 rounded-full">Yeni</span>}
                </div>
                <div className="flex gap-4 mt-2">
                  <Link href={`/admin/urunler/${p.id}/duzenle`} className="text-[12px] text-[#3d7b74] font-semibold hover:text-[#1d3435] transition-colors">Düzenle</Link>
                  <button onClick={() => setDeleteId(p.id)} className="text-[12px] text-red-400 font-semibold hover:text-red-600 transition-colors">Sil</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Desktop Tablo (md üstü) ── */}
      <div className="hidden md:block bg-white rounded-sm border border-[#f0f0f0] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#999] text-[13px]">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0]">
                  {["Görsel", "Ürün", "Kategori", "Fiyat", "Stok", "Durum", "İşlem"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-[#999]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-[#999] text-[13px]">Ürün bulunamadı.</td></tr>
                )}
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[#f9f8f6] hover:bg-[#f9f8f6] transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-12 rounded-sm overflow-hidden bg-[#f0ede9]">
                        {p.images[0] && <Image src={p.images[0]} alt={p.name} fill unoptimized className="object-cover" sizes="40px" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-semibold text-[#1d3435]">{p.name}</p>
                      <p className="text-[11px] text-[#999] font-mono">{p.slug}</p>
                      <div className="flex gap-1 mt-1">
                        {p.isBestseller && <span className="text-[10px] bg-[#1d3435] text-white px-1.5 py-0.5 rounded-full">Best</span>}
                        {p.isNew && <span className="text-[10px] bg-[#3d7b74] text-white px-1.5 py-0.5 rounded-full">Yeni</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] text-[#1d3435] font-medium">{p.category}</p>
                      {p.subCategory && <p className="text-[11px] text-[#3d7b74] mt-0.5">↳ {p.subCategory}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-bold text-[#1d3435]">₺{(p.salePrice ?? p.price).toLocaleString("tr-TR")}</p>
                      {p.salePrice && <p className="text-[11px] text-[#999] line-through">₺{p.price.toLocaleString("tr-TR")}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] font-semibold ${(p.stock ?? 0) === 0 ? "text-red-500" : (p.stock ?? 0) < 5 ? "text-yellow-600" : "text-[#3d7b74]"}`}>
                        {p.stock ?? 0} adet
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(p)}>
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-[#f0f0f0] text-[#999]"}`}>
                          {p.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/urunler/${p.id}/duzenle`} className="text-[12px] text-[#3d7b74] hover:text-[#1d3435] font-medium transition-colors">Düzenle</Link>
                        <button onClick={() => setDeleteId(p.id)} className="text-[12px] text-red-400 hover:text-red-600 font-medium transition-colors">Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
              <h2 className="font-semibold text-[15px] text-[#1d3435]">
                {editingId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#999] hover:text-[#1d3435]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Ürün Adı */}
              <div>
                <label className={labelClass}>Ürün Adı *</label>
                <input type="text" className={inputClass} value={form.name}
                  onChange={(e) => { up("name", e.target.value); up("slug", autoSlug(e.target.value)); }}
                  placeholder="Kırmızı Gül Buketi" autoFocus />
              </div>

              {/* Slug */}
              <div>
                <label className={labelClass}>Slug (URL)</label>
                <input type="text" className={inputClass} value={form.slug}
                  onChange={(e) => up("slug", e.target.value)} placeholder="kirmizi-gul-buketi" />
                <p className="text-[11px] text-[#999] mt-1">Ürün adresi: /urun/<strong>{form.slug || "..."}</strong></p>
              </div>

              {/* Kategori seçimi */}
              <div className="border border-[#e8e8e8] rounded-sm p-4 space-y-4 bg-[#fafafa]">
                <p className={labelClass + " mb-0"}>Kategori & Alt Kategori</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#999] mb-1.5">Ana Kategori *</label>
                    <select className={inputClass} value={form.categorySlug}
                      onChange={(e) => {
                        const cat = categories.find((c) => c.slug === e.target.value);
                        up("categorySlug", e.target.value);
                        up("category", cat?.name ?? "");
                        up("categoryId", cat?.id ?? "");
                        up("subCategorySlug", "");
                        up("subCategory", "");
                      }}>
                      <option value="">Seçin...</option>
                      {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#999] mb-1.5">
                      Alt Kategori {subCategories.length === 0 && form.categorySlug ? <span className="text-[#bbb]">(bu kategoride alt kategori yok)</span> : ""}
                    </label>
                    <select className={inputClass} value={form.subCategorySlug}
                      disabled={subCategories.length === 0}
                      onChange={(e) => {
                        const sub = subCategories.find((s) => s.slug === e.target.value);
                        up("subCategorySlug", e.target.value);
                        up("subCategory", sub?.name ?? "");
                      }}>
                      <option value="">Seçin...</option>
                      {subCategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                {form.categorySlug && (
                  <p className="text-[11px] text-[#3d7b74]">
                    Konum: <strong>{form.category}</strong>{form.subCategory ? ` › ${form.subCategory}` : ""}
                  </p>
                )}

                {/* Ek Kategoriler */}
                <div className="border-t border-[#e8e8e8] pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1d3435]">Ek Kategoriler</p>
                    <button type="button"
                      onClick={() => up("extraCategorySlugs", [...form.extraCategorySlugs, { categorySlug: "", subCategorySlug: "" }] as never)}
                      className="text-[11px] text-[#3d7b74] hover:underline font-semibold">
                      + Kategori Ekle
                    </button>
                  </div>
                  {form.extraCategorySlugs.length === 0 && (
                    <p className="text-[11px] text-[#bbb]">Bu ürün yalnızca ana kategorisinde görünür.</p>
                  )}
                  {form.extraCategorySlugs.map((ec, idx) => {
                    const ecCatObj = categories.find((c) => c.slug === ec.categorySlug);
                    const ecSubs = ecCatObj?.megaMenu?.flatMap((col) => col.items) ?? [];
                    const updateEc = (field: "categorySlug" | "subCategorySlug", val: string) => {
                      const updated = form.extraCategorySlugs.map((item, i) =>
                        i === idx ? { ...item, [field]: val, ...(field === "categorySlug" ? { subCategorySlug: "" } : {}) } : item
                      );
                      up("extraCategorySlugs", updated as never);
                    };
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <select className={inputClass} value={ec.categorySlug}
                          onChange={(e) => updateEc("categorySlug", e.target.value)}>
                          <option value="">Ana Kategori...</option>
                          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                        </select>
                        <select className={inputClass} value={ec.subCategorySlug ?? ""}
                          disabled={ecSubs.length === 0}
                          onChange={(e) => updateEc("subCategorySlug", e.target.value)}>
                          <option value="">Alt Kategori...</option>
                          {ecSubs.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                        </select>
                        <button type="button"
                          onClick={() => up("extraCategorySlugs", form.extraCategorySlugs.filter((_, i) => i !== idx) as never)}
                          className="text-red-400 hover:text-red-600 flex-shrink-0 text-[18px] leading-none">×</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fiyatlar */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Normal Fiyat (₺) *</label>
                  <input type="text" inputMode="decimal" className={inputClass} value={form.price}
                    onChange={(e) => up("price", e.target.value)} placeholder="450" />
                </div>
                <div>
                  <label className={labelClass}>İndirimli Fiyat (₺)</label>
                  <input type="text" inputMode="decimal" className={inputClass} value={form.salePrice}
                    onChange={(e) => up("salePrice", e.target.value)} placeholder="Boş bırakın" />
                </div>
                <div>
                  <label className={labelClass}>Stok Adeti</label>
                  <input type="text" inputMode="numeric" className={inputClass} value={form.stock}
                    onChange={(e) => up("stock", e.target.value)} placeholder="0" />
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className={labelClass}>Ürün Açıklaması</label>
                <textarea rows={4} className={inputClass + " resize-none"} value={form.description}
                  onChange={(e) => up("description", e.target.value)}
                  placeholder="Ürün hakkında detaylı bilgi yazın..." />
              </div>

              {/* Bakım Talimatları */}
              <div>
                <label className={labelClass}>Bakım Talimatları</label>
                <textarea rows={3} className={inputClass + " resize-none"} value={form.careInstructions}
                  onChange={(e) => up("careInstructions", e.target.value)}
                  placeholder="Örn: Serin ve güneş almayan ortamda saklayın. Her 2 günde bir su değiştiriniz..." />
              </div>

              {/* Görseller */}
              <div className="space-y-3">
                <p className={labelClass}>Ürün Görselleri</p>
                {[0, 1].map((i) => (
                  <ImageUploadField key={i}
                    label={i === 0 ? "Ana Görsel *" : "Hover Görseli (İkinci Görsel)"}
                    value={form.images[i] ?? ""}
                    onChange={(url) => { const imgs = [...form.images]; imgs[i] = url; up("images", imgs); }}
                  />
                ))}
              </div>

              {/* Toggle'lar */}
              <div className="pt-2 border-t border-[#f0f0f0] space-y-3">
                <div className="flex flex-wrap gap-5">
                  <Toggle checked={form.isActive} onChange={(v) => up("isActive", v)} label="Satışta (Aktif)" />
                  <Toggle checked={form.isBestseller} onChange={(v) => up("isBestseller", v)} label="En Çok Satan" />
                  <Toggle checked={form.isNew} onChange={(v) => up("isNew", v)} label="Yeni Ürün" />
                </div>
                <div className="pt-2 border-t border-[#f5f5f5]">
                  <Toggle
                    checked={form.isPinnedToVitrin}
                    onChange={(v) => up("isPinnedToVitrin", v)}
                    label="Ana Sayfa Vitrinine Sabitle"
                  />
                  {form.isPinnedToVitrin && (
                    <p className="text-[11px] text-[#3d7b74] mt-1.5 ml-[52px] font-medium">
                      Bu ürün ana sayfada öncelikli olarak gösterilecek.
                    </p>
                  )}
                </div>
              </div>

              {saveError && <p className="text-red-500 text-[12px] bg-red-50 px-3 py-2 rounded-sm">{saveError}</p>}
            </div>

            <div className="px-6 py-4 border-t border-[#f0f0f0] flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)}
                className="px-5 py-2 text-[13px] text-[#545454] border border-[#e8e8e8] rounded-sm hover:text-[#1d3435] transition-colors">
                İptal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary py-2 px-6 text-[13px] disabled:opacity-60">
                {saving ? "Kaydediliyor..." : editingId ? "Değişiklikleri Kaydet" : "Ürünü Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme onayı */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="font-semibold text-[#1d3435] mb-1">Ürünü silmek istiyor musunuz?</p>
            <p className="text-[13px] text-[#999] mb-6">Bu işlem geri alınamaz.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)}
                className="px-5 py-2 border border-[#e8e8e8] rounded-sm text-[13px] text-[#545454] hover:text-[#1d3435] transition-colors">
                İptal
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-5 py-2 bg-red-500 text-white rounded-sm text-[13px] font-semibold hover:bg-red-600 transition-colors">
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
