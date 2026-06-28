"use client";

import { useState, useEffect } from "react";
import type { Category } from "@/types";
import { navCategories } from "@/lib/data";

const inputClass =
  "w-full border border-[#e8e8e8] rounded-sm px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] transition-colors bg-white";
const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1.5";

interface SubItem { name: string; slug: string }
interface MegaCol { heading: string; items: SubItem[] }

const emptyForm = { name: "", slug: "", displayOrder: 0 };

function autoSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminKategorilerPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [megaMenu, setMegaMenu] = useState<MegaCol[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    if (res.ok) {
      const dbCats: Category[] = await res.json();
      const merged = dbCats.map((cat) => {
        const staticCat = navCategories.find((c) => c.slug === cat.slug);
        return {
          ...cat,
          megaMenu: (cat.megaMenu && cat.megaMenu.length > 0) ? cat.megaMenu : (staticCat?.megaMenu ?? []),
        };
      });
      setCategories(merged);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, displayOrder: categories.length + 1 });
    setMegaMenu([]);
    setSaveError("");
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, displayOrder: cat.displayOrder ?? 0 });
    setMegaMenu(
      (cat.megaMenu ?? []).map((col) => ({
        heading: col.heading,
        items: col.items.map((i) => ({ name: i.name, slug: i.slug })),
      }))
    );
    setSaveError("");
    setModalOpen(true);
  };

  const addCol = () => setMegaMenu((p) => [...p, { heading: "", items: [] }]);
  const removeCol = (ci: number) => setMegaMenu((p) => p.filter((_, i) => i !== ci));
  const updateColHeading = (ci: number, val: string) =>
    setMegaMenu((p) => p.map((c, i) => i === ci ? { ...c, heading: val } : c));
  const addItem = (ci: number) =>
    setMegaMenu((p) => p.map((c, i) => i === ci ? { ...c, items: [...c.items, { name: "", slug: "" }] } : c));
  const removeItem = (ci: number, ii: number) =>
    setMegaMenu((p) => p.map((c, i) => i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c));
  const updateItem = (ci: number, ii: number, field: "name" | "slug", val: string) =>
    setMegaMenu((p) => p.map((c, i) =>
      i === ci ? {
        ...c, items: c.items.map((it, j) =>
          j === ii ? { ...it, [field]: field === "name" ? val : val, slug: field === "name" ? autoSlug(val) : val } : it
        )
      } : c
    ));

  const handleSave = async () => {
    if (!form.name) { setSaveError("Kategori adı zorunludur."); return; }
    setSaving(true);
    setSaveError("");
    const slug = form.slug || autoSlug(form.name);
    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug, megaMenu }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Kayıt hatası");
      }
      await fetchCategories();
      setModalOpen(false);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await fetchCategories();
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#999]">{categories.length} kategori</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kategori
        </button>
      </div>

      <div className="bg-white rounded-sm border border-[#f0f0f0] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#999] text-[13px]">Yükleniyor...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                {["Sıra", "Kategori Adı", "Alt Kategori", "Slug", "İşlemler"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-[#999]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#999] text-[13px]">
                    Henüz kategori yok. Yukarıdan yeni kategori ekleyin.
                  </td>
                </tr>
              )}
              {categories.map((cat) => {
                const subCount = (cat.megaMenu ?? []).reduce((n, c) => n + c.items.length, 0);
                return (
                  <tr key={cat.id} className="border-b border-[#f9f8f6] hover:bg-[#f9f8f6] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] text-[#999] w-16">{cat.displayOrder ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-semibold text-[#1d3435]">{cat.name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#999]">
                      {subCount > 0 ? `${subCount} alt kategori` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] font-mono text-[#999]">/{cat.slug}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(cat)} className="text-[12px] text-[#3d7b74] hover:text-[#1d3435] font-medium transition-colors">
                          Düzenle
                        </button>
                        <button onClick={() => setDeleteId(cat.id)} className="text-[12px] text-red-400 hover:text-red-600 font-medium transition-colors">
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-[#f9f8f6] rounded-sm p-4 text-[13px] text-[#545454] border border-[#e8e8e8]">
        <strong className="text-[#1d3435]">Not:</strong> Kategori eklendiğinde site menüsüne otomatik yansır.
        Alt kategoriler menüde dropdown olarak görünür.
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] flex-shrink-0">
              <h2 className="font-semibold text-[15px] text-[#1d3435]">
                {editingId ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-[#999] hover:text-[#1d3435]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              {/* Temel bilgiler */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Kategori Adı *</label>
                  <input type="text" className={inputClass} value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value, slug: autoSlug(e.target.value) }))}
                    placeholder="Ör: Güller" autoFocus />
                </div>
                <div>
                  <label className={labelClass}>Sıra No</label>
                  <input type="number" className={inputClass} value={form.displayOrder}
                    onChange={(e) => setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Slug (URL)</label>
                <input type="text" className={inputClass} value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="guller" />
                <p className="text-[11px] text-[#999] mt-1">Site adresi: /<strong>{form.slug || "..."}</strong></p>
              </div>

              {/* Alt Kategoriler */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={labelClass + " mb-0"}>Alt Kategoriler (Dropdown Menü)</label>
                  <button onClick={addCol}
                    className="text-[11px] text-[#3d7b74] hover:text-[#1d3435] font-semibold flex items-center gap-1 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Grup Ekle
                  </button>
                </div>

                {megaMenu.length === 0 && (
                  <p className="text-[12px] text-[#bbb] py-3 text-center border border-dashed border-[#e8e8e8] rounded-sm">
                    Alt kategori yok. "Grup Ekle" ile dropdown menü oluşturabilirsin.
                  </p>
                )}

                <div className="space-y-4">
                  {megaMenu.map((col, ci) => (
                    <div key={ci} className="border border-[#e8e8e8] rounded-sm p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          className={inputClass}
                          value={col.heading}
                          onChange={(e) => updateColHeading(ci, e.target.value)}
                          placeholder="Grup başlığı (ör: Çiçek Türleri)"
                        />
                        <button onClick={() => removeCol(ci)}
                          className="text-red-400 hover:text-red-600 flex-shrink-0 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {col.items.map((item, ii) => (
                          <div key={ii} className="flex items-center gap-2">
                            <input
                              type="text"
                              className={inputClass}
                              value={item.name}
                              onChange={(e) => updateItem(ci, ii, "name", e.target.value)}
                              placeholder="Alt kategori adı"
                            />
                            <input
                              type="text"
                              className={inputClass + " font-mono text-[12px]"}
                              value={item.slug}
                              onChange={(e) => updateItem(ci, ii, "slug", e.target.value)}
                              placeholder="slug"
                            />
                            <button onClick={() => removeItem(ci, ii)}
                              className="text-red-400 hover:text-red-600 flex-shrink-0 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button onClick={() => addItem(ci)}
                          className="text-[11px] text-[#3d7b74] hover:text-[#1d3435] font-medium flex items-center gap-1 mt-1 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Alt kategori ekle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {saveError && (
                <p className="text-red-500 text-[12px] bg-red-50 px-3 py-2 rounded-sm">{saveError}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#f0f0f0] flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setModalOpen(false)}
                className="px-5 py-2 text-[13px] text-[#545454] border border-[#e8e8e8] rounded-sm hover:text-[#1d3435] transition-colors">
                İptal
              </button>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary py-2 px-6 text-[13px] disabled:opacity-60">
                {saving ? "Kaydediliyor..." : editingId ? "Kaydet" : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme onayı */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-xl p-6 max-w-sm w-full text-center">
            <p className="font-semibold text-[#1d3435] mb-2">Kategoriyi sil?</p>
            <p className="text-[13px] text-[#999] mb-6">
              Bu kategorideki ürünler kategorisiz kalır. İşlem geri alınamaz.
            </p>
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
