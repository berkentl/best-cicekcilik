"use client";

import { useState, useEffect, useCallback } from "react";

interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  expiry: string | null;
  usedCount: number;
  isActive: boolean;
}

const emptyForm = {
  code: "",
  type: "percent" as "percent" | "fixed",
  value: "",
  minOrder: "",
  expiry: "",
  isActive: true,
};

export default function AdminKampanyalarPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) setCoupons(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditId(c.id);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrder: String(c.minOrder),
      expiry: c.expiry ?? "",
      isActive: c.isActive,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) { setError("Kod ve değer zorunludur."); return; }
    setSaving(true);
    setError("");
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder || 0),
        expiry: form.expiry || null,
        isActive: form.isActive,
      };
      const res = editId
        ? await fetch(`/api/coupons/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Kayıt hatası"); }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kuponu silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    fetchCoupons();
  };

  const handleToggle = async (c: Coupon) => {
    await fetch(`/api/coupons/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: c.code,
        type: c.type,
        value: c.value,
        minOrder: c.minOrder,
        expiry: c.expiry,
        isActive: !c.isActive,
      }),
    });
    fetchCoupons();
  };

  const isExpired = (expiry: string | null) =>
    expiry ? new Date(expiry) < new Date() : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-[#1d3435]">Kupon Yönetimi</h1>
          <p className="text-[12px] text-[#999] mt-0.5">Kampanya ve indirim kuponlarını yönetin</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#1d3435] text-white rounded-md text-[13px] font-bold hover:bg-[#2a4a4b] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Kupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Toplam Kupon", value: coupons.length, color: "text-[#1d3435]" },
          {
            label: "Aktif",
            value: coupons.filter((c) => c.isActive && !isExpired(c.expiry)).length,
            color: "text-[#3d7b74]",
          },
          {
            label: "Süresi Geçmiş",
            value: coupons.filter((c) => isExpired(c.expiry)).length,
            color: "text-orange-500",
          },
          {
            label: "Toplam Kullanım",
            value: coupons.reduce((s, c) => s + c.usedCount, 0),
            color: "text-[#1d3435]",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-[#ebebeb] p-4">
            <p className="text-[11px] text-[#999] uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#ebebeb] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#f0f0f0] flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#1d3435]">Kupon Listesi</p>
          <p className="text-[12px] text-[#999]">{coupons.length} kupon</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#999] text-sm">
            Yükleniyor...
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="w-12 h-12 text-[#d0cdc8] mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <p className="text-[13px] text-[#999]">Henüz kupon eklenmemiş.</p>
            <button
              onClick={openNew}
              className="mt-3 text-[12px] text-[#3d7b74] underline hover:no-underline"
            >
              İlk kuponu oluştur
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                  {["Kod", "İndirim", "Min. Sipariş", "Son Kullanım", "Kullanım", "Durum", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-[#999]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const expired = isExpired(c.expiry);
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-[#1d3435] bg-[#f0f0f0] px-2 py-0.5 rounded text-[12px]">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[#3d7b74]">
                        {c.type === "percent" ? `%${c.value}` : `₺${c.value}`}
                      </td>
                      <td className="px-4 py-3.5 text-[#545454]">
                        {c.minOrder > 0 ? `₺${c.minOrder}` : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        {c.expiry ? (
                          <span className={expired ? "text-red-500" : "text-[#545454]"}>
                            {new Date(c.expiry).toLocaleDateString("tr-TR")}
                            {expired && " (Geçti)"}
                          </span>
                        ) : (
                          <span className="text-[#999]">Süresiz</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[#545454]">{c.usedCount} kez</td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggle(c)}
                          className={`relative inline-flex items-center w-10 rounded-full transition-colors ${
                            c.isActive && !expired ? "bg-[#3d7b74]" : "bg-[#e0e0e0]"
                          }`}
                          style={{ height: "22px" }}
                        >
                          <span
                            className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all ${
                              c.isActive ? "left-5" : "left-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEdit(c)}
                            className="text-[#999] hover:text-[#1d3435] transition-colors p-1"
                            title="Düzenle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-[#999] hover:text-red-500 transition-colors p-1"
                            title="Sil"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
              <h2 className="font-heading text-[16px] font-semibold text-[#1d3435]">
                {editId ? "Kuponu Düzenle" : "Yeni Kupon Oluştur"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#999] hover:text-[#1d3435] transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] px-3 py-2 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1d3435] mb-1.5">
                  Kupon Kodu *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="HOSGELDIN20"
                  className="w-full border border-[#e8e8e8] rounded-sm px-3 py-2 text-[13px] uppercase focus:outline-none focus:border-[#3d7b74] transition-colors font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1d3435] mb-1.5">
                    İndirim Tipi *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "fixed" })}
                    className="w-full border border-[#e8e8e8] rounded-sm px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] transition-colors"
                  >
                    <option value="percent">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1d3435] mb-1.5">
                    Değer *
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder={form.type === "percent" ? "20" : "50"}
                    min="0"
                    step="0.01"
                    className="w-full border border-[#e8e8e8] rounded-sm px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1d3435] mb-1.5">
                    Min. Sipariş (₺)
                  </label>
                  <input
                    type="number"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                    placeholder="200"
                    min="0"
                    className="w-full border border-[#e8e8e8] rounded-sm px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[#1d3435] mb-1.5">
                    Son Kullanım
                  </label>
                  <input
                    type="date"
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-[#e8e8e8] rounded-sm px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-[13px] font-medium text-[#1d3435]">Aktif</p>
                  <p className="text-[11px] text-[#999]">Kapalıysa müşteriler bu kuponu kullanamaz</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative inline-flex items-center w-11 rounded-full transition-colors flex-shrink-0 ${
                    form.isActive ? "bg-[#3d7b74]" : "bg-[#e0e0e0]"
                  }`}
                  style={{ height: "24px" }}
                >
                  <span
                    className={`absolute bg-white rounded-full shadow transition-all ${
                      form.isActive ? "left-6" : "left-1"
                    }`}
                    style={{ width: "16px", height: "16px" }}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-[#e8e8e8] rounded-sm py-2.5 text-[13px] text-[#545454] hover:bg-[#f5f5f5] transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#1d3435] text-white rounded-sm py-2.5 text-[13px] font-bold hover:bg-[#2a4a4b] transition-colors disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : editId ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
