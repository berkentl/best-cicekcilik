"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Product } from "@/types";

const dailySales = [
  { gun: "Pzt", ciro: 1840, siparis: 6 },
  { gun: "Sal", ciro: 2200, siparis: 9 },
  { gun: "Çar", ciro: 1650, siparis: 5 },
  { gun: "Per", ciro: 3100, siparis: 12 },
  { gun: "Cum", ciro: 4500, siparis: 18 },
  { gun: "Cmt", ciro: 5200, siparis: 21 },
  { gun: "Paz", ciro: 3800, siparis: 14 },
];

const topProducts = [
  { ad: "Kırmızı Gül", satis: 42 },
  { ad: "Orkide Set", satis: 31 },
  { ad: "Çikolata Kutu", satis: 28 },
  { ad: "Beyaz Lale", satis: 22 },
  { ad: "Pastel Buket", satis: 17 },
];

const mockOrders = [
  { id: "#10241", musteri: "Ayşe Kaya", tarih: "Bugün 14:32", tutar: 650, durum: "Hazırlanıyor" },
  { id: "#10240", musteri: "Mehmet Demir", tarih: "Bugün 12:15", tutar: 420, durum: "Kargoya Verildi" },
  { id: "#10239", musteri: "Fatma Şahin", tarih: "Bugün 10:05", tutar: 890, durum: "Teslim Edildi" },
  { id: "#10238", musteri: "Ali Öztürk", tarih: "Dün 18:44", tutar: 320, durum: "Yeni" },
  { id: "#10237", musteri: "Zeynep Arslan", tarih: "Dün 16:20", tutar: 1200, durum: "Teslim Edildi" },
];

const statusColors: Record<string, string> = {
  "Yeni": "bg-blue-100 text-blue-700",
  "Hazırlanıyor": "bg-yellow-100 text-yellow-700",
  "Kargoya Verildi": "bg-purple-100 text-purple-700",
  "Teslim Edildi": "bg-green-100 text-green-700",
  "İptal": "bg-red-100 text-red-700",
};

function StatCard({ title, value, sub, icon, trend, color }: {
  title: string; value: string; sub: string; icon: React.ReactNode; trend?: number; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#ebebeb] p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-[#999] uppercase tracking-widest font-semibold mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#1d3435]">{value}</p>
          <p className="text-[12px] text-[#999] mt-1">{sub}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-[12px] font-semibold ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d={trend >= 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
          </svg>
          {Math.abs(trend)}% geçen haftaya göre
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    fetch("/api/products?active=false")
      .then((r) => r.json())
      .then((data: Product[]) => { setProducts(data); setProductCount(data.length); })
      .catch(() => {});
  }, []);

  const lowStock = products.filter((p) => (p.stock ?? 0) < 5);
  const weeklyRevenue = dailySales.reduce((s, d) => s + d.ciro, 0);
  const weeklyOrders = dailySales.reduce((s, d) => s + d.siparis, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1d3435]">Genel Bakış</h1>
        <p className="text-[13px] text-[#999] mt-0.5">Son 7 günün performans özeti</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Haftalık Ciro" value={`₺${weeklyRevenue.toLocaleString("tr-TR")}`} sub="Son 7 gün" trend={12} color="bg-[#1d3435]/10"
          icon={<svg className="w-5 h-5 text-[#1d3435]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Haftalık Sipariş" value={weeklyOrders.toString()} sub="Son 7 gün" trend={8} color="bg-blue-50"
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        <StatCard title="Aktif Ürünler" value={productCount.toString()} sub="Sitede yayında" color="bg-[#3d7b74]/10"
          icon={<svg className="w-5 h-5 text-[#3d7b74]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
        <StatCard
          title="Stok Alarmı"
          value={lowStock.length.toString()}
          sub={lowStock.length === 0 ? "Tüm stoklar yeterli" : "Kritik stok seviyesi"}
          color={lowStock.length === 0 ? "bg-green-50" : "bg-red-50"}
          icon={lowStock.length === 0
            ? <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            : <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#ebebeb] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[14px] font-bold text-[#1d3435]">Günlük Satış Grafiği</h2>
              <p className="text-[12px] text-[#999]">Ciro ve sipariş trendi</p>
            </div>
            <span className="text-[12px] text-[#3d7b74] font-semibold bg-[#3d7b74]/10 px-3 py-1 rounded-full">Bu Hafta</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="gun" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #ebebeb", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="ciro" name="Ciro (₺)" stroke="#1d3435" strokeWidth={2.5} dot={{ r: 4, fill: "#1d3435" }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="siparis" name="Sipariş" stroke="#3d7b74" strokeWidth={2.5} dot={{ r: 4, fill: "#3d7b74" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-[#ebebeb] p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-[14px] font-bold text-[#1d3435]">En Çok Satanlar</h2>
            <p className="text-[12px] text-[#999]">Bu haftanın öne çıkan ürünleri</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="ad" tick={{ fontSize: 11, fill: "#545454" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #ebebeb", fontSize: 12 }} />
              <Bar dataKey="satis" name="Satış" fill="#3d7b74" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Son Siparişler */}
        <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f5f5f5]">
            <h2 className="text-[14px] font-bold text-[#1d3435]">Son Siparişler</h2>
            <Link href="/admin/siparisler" className="text-[12px] text-[#3d7b74] font-semibold hover:text-[#1d3435] transition-colors">Tümünü Gör →</Link>
          </div>
          <div className="divide-y divide-[#f9f9f9]">
            {mockOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fafafa] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#1d3435]">{o.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[o.durum] ?? "bg-gray-100 text-gray-600"}`}>{o.durum}</span>
                  </div>
                  <p className="text-[12px] text-[#999]">{o.musteri} · {o.tarih}</p>
                </div>
                <span className="text-[13px] font-bold text-[#1d3435]">₺{o.tutar.toLocaleString("tr-TR")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stok Alarmı */}
        <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f5f5f5]">
            <h2 className="text-[14px] font-bold text-[#1d3435]">Stok Alarmı</h2>
            <Link href="/admin/urunler" className="text-[12px] text-[#3d7b74] font-semibold hover:text-[#1d3435] transition-colors">Ürünlere Git →</Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#1d3435]">Tüm stoklar yeterli</p>
              <p className="text-[12px] text-[#999] mt-0.5">Kritik stok seviyesinde ürün yok</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f9f9f9]">
              {lowStock.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fafafa] transition-colors">
                  <div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1d3435] truncate">{p.name}</p>
                    <p className="text-[11px] text-[#999]">{p.category}</p>
                  </div>
                  <span className={`text-[12px] font-bold px-2.5 py-1 rounded-md ${(p.stock ?? 0) === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                    {p.stock ?? 0} adet
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-[#ebebeb] p-5 shadow-sm">
        <h2 className="text-[14px] font-bold text-[#1d3435] mb-4">Hızlı İşlemler</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/admin/urunler/yeni", label: "Yeni Ürün Ekle", primary: true },
            { href: "/admin/kategoriler", label: "Kategori Ekle", primary: false },
            { href: "/admin/kampanyalar", label: "Kupon Oluştur", primary: false },
            { href: "/admin/siparisler", label: "Siparişleri Gör", primary: false },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-[13px] font-semibold transition-colors ${
                a.primary ? "bg-[#1d3435] text-white hover:bg-[#2a4a4b]" : "border border-[#e8e8e8] text-[#1d3435] hover:border-[#1d3435]"
              }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
