"use client";

import { useState, useEffect, useMemo } from "react";
import { SearchIcon, XIcon, DownloadIcon } from "@/components/icons";

interface Customer {
  id: string | null;
  name: string;
  email: string;
  phone: string;
  isMember: boolean;
  orders: number;
  total: number;
  joined: string;
}

export default function AdminMusterilerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [memberOnly, setMemberOnly] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/customers");
        if (!res.ok) return;
        const data: Customer[] = await res.json();
        setCustomers(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const newThisMonth = customers.filter((c) => new Date(c.joined) >= thisMonth).length;
  const avgOrder = customers.length > 0
    ? Math.round(customers.reduce((s, c) => s + c.total, 0) / customers.reduce((s, c) => s + c.orders, 0))
    : 0;

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (memberOnly && !c.isMember) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    });
  }, [customers, query, memberOnly]);

  function handleExportCsv() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();

    const params = new URLSearchParams({ date: `${dd}-${mm}-${yyyy}` });
    if (memberOnly) params.set("memberOnly", "true");
    if (query.trim()) params.set("q", query.trim());

    // Dosya, tarayıcının kendi indirme mekanizmasının güvenilir çalışması için
    // sunucudan Content-Disposition header'ıyla geliyor (client-side blob yerine).
    window.location.href = `/api/admin/customers/export?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-medium text-[#1d3435]">Müşteri Yönetimi</h1>
        <p className="text-[13px] text-[#999]">Müşteri profilleri ve satın alma geçmişleri</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Toplam Müşteri", value: loading ? null : customers.length.toString() },
          { label: "Kayıtlı Üye", value: loading ? null : customers.filter((c) => c.isMember).length.toString() },
          { label: "Bu Ay Yeni", value: loading ? null : newThisMonth.toString() },
          { label: "Ort. Sipariş Değeri", value: loading ? null : `₺${avgOrder.toLocaleString("tr-TR")}` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#ebebeb] p-5 shadow-sm">
            <p className="text-[11px] text-[#999] uppercase tracking-widest font-bold mb-1">{s.label}</p>
            {s.value === null ? (
              <div className="h-8 w-16 bg-[#f0f0f0] rounded animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-black text-[#1d3435]">{s.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f5f5f5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-[14px] font-bold text-[#1d3435]">Müşteri Listesi</h2>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="İsim veya e-posta ara..."
                className="w-full sm:w-64 pl-9 pr-8 py-2 text-[13px] border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/10 transition-all bg-white"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#1d3435] transition-colors"
                  aria-label="Aramayı temizle"
                >
                  <XIcon size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => setMemberOnly((v) => !v)}
              className={`whitespace-nowrap text-[12px] font-semibold px-3.5 py-2 rounded-lg border transition-colors ${
                memberOnly
                  ? "bg-[#3d7b74] border-[#3d7b74] text-white"
                  : "bg-white border-[#e8e8e8] text-[#666] hover:border-[#3d7b74]/40"
              }`}
            >
              Sadece Kayıtlı Üyeler
            </button>
            <button
              onClick={handleExportCsv}
              disabled={loading || filteredCustomers.length === 0}
              className="whitespace-nowrap flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-lg border border-[#e8e8e8] text-[#666] hover:border-[#3d7b74]/40 hover:text-[#3d7b74] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#e8e8e8] disabled:hover:text-[#666]"
            >
              <DownloadIcon size={14} />
              CSV İndir
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f5f5f5] bg-[#fafafa]">
                {["Müşteri", "Tür", "E-posta", "Telefon", "Sipariş", "Toplam Harcama", "Kayıt / İlk Sipariş"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#999]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-[13px] text-[#999]">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-[13px] text-[#999]">
                    {customers.length === 0
                      ? "Henüz kayıtlı müşteri yok"
                      : "Aramanızla eşleşen müşteri bulunamadı"}
                  </td>
                </tr>
              ) : filteredCustomers.map((c) => (
                <tr key={c.email} className="border-b border-[#f9f9f9] hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1d3435]/10 flex items-center justify-center text-[12px] font-bold text-[#1d3435]">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[13px] font-semibold text-[#1d3435]">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                        c.isMember ? "bg-[#3d7b74]/10 text-[#3d7b74]" : "bg-[#f0f0f0] text-[#999]"
                      }`}
                    >
                      {c.isMember ? "Üye" : "Misafir"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#545454]">{c.email}</td>
                  <td className="px-4 py-3.5 text-[13px] text-[#545454]">{c.phone}</td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#1d3435]">{c.orders} sipariş</td>
                  <td className="px-4 py-3.5 text-[13px] font-bold text-[#3d7b74]">₺{c.total.toLocaleString("tr-TR")}</td>
                  <td className="px-4 py-3.5 text-[12px] text-[#999]">
                    {new Date(c.joined).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
