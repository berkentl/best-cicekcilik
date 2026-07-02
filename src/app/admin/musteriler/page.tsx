"use client";

import { useState, useEffect } from "react";

interface Customer {
  name: string;
  email: string;
  phone: string;
  orders: number;
  total: number;
  joined: string;
}

export default function AdminMusterilerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const orders: {
          email: string;
          customer_name: string;
          customer_phone: string;
          total_amount: number;
          status: string;
          created_at: string;
        }[] = await res.json();

        const map = new Map<string, Customer>();
        for (const o of orders) {
          if (!o.email) continue;
          if (map.has(o.email)) {
            const c = map.get(o.email)!;
            c.orders += 1;
            if (o.status !== "İptal" && o.status !== "cancelled")
              c.total += o.total_amount ?? 0;
          } else {
            map.set(o.email, {
              name: o.customer_name || o.email,
              email: o.email,
              phone: o.customer_phone || "—",
              orders: 1,
              total: o.status !== "İptal" && o.status !== "cancelled" ? (o.total_amount ?? 0) : 0,
              joined: o.created_at,
            });
          }
        }

        setCustomers(Array.from(map.values()).sort((a, b) => b.total - a.total));
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1d3435]">Müşteri Yönetimi</h1>
        <p className="text-[13px] text-[#999]">Müşteri profilleri ve satın alma geçmişleri</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Toplam Müşteri", value: loading ? null : customers.length.toString() },
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
        <div className="px-5 py-4 border-b border-[#f5f5f5]">
          <h2 className="text-[14px] font-bold text-[#1d3435]">Müşteri Listesi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f5f5f5] bg-[#fafafa]">
                {["Müşteri", "E-posta", "Telefon", "Sipariş", "Toplam Harcama", "İlk Sipariş"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#999]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-[13px] text-[#999]">
                    Yükleniyor...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-[13px] text-[#999]">
                    Henüz kayıtlı müşteri yok
                  </td>
                </tr>
              ) : customers.map((c) => (
                <tr key={c.email} className="border-b border-[#f9f9f9] hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1d3435]/10 flex items-center justify-center text-[12px] font-bold text-[#1d3435]">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[13px] font-semibold text-[#1d3435]">{c.name}</span>
                    </div>
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
