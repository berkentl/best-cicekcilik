"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import type { Product } from "@/types";
import { supabase } from "@/lib/supabase";
import { fetchDashboardData, type DashboardStats, type DashboardOrder } from "./dashboard-actions";

// ─── Tipler ──────────────────────────────────────────────────────────────────

type Preset = "thisWeek" | "lastWeek" | "thisMonth" | "last30";

interface DateRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  label: string;
}

// ─── Tarih Yardımcıları ──────────────────────────────────────────────────────

function getWeekStart(offsetWeeks = 0): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff - offsetWeeks * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function buildRange(preset: Preset): DateRange {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  switch (preset) {
    case "thisWeek": {
      const start = getWeekStart(0);
      const end = new Date(start); end.setDate(start.getDate() + 7);
      const prevStart = getWeekStart(1);
      const prevEnd = new Date(prevStart); prevEnd.setDate(prevStart.getDate() + 7);
      return { start, end, prevStart, prevEnd, label: "Bu Hafta" };
    }
    case "lastWeek": {
      const start = getWeekStart(1);
      const end = new Date(start); end.setDate(start.getDate() + 7);
      const prevStart = getWeekStart(2);
      const prevEnd = new Date(prevStart); prevEnd.setDate(prevStart.getDate() + 7);
      return { start, end, prevStart, prevEnd, label: "Geçen Hafta" };
    }
    case "thisMonth": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = today;
      const prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const prevEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
      return { start, end, prevStart, prevEnd, label: "Bu Ay" };
    }
    case "last30": {
      const start = new Date(today); start.setDate(today.getDate() - 29); start.setHours(0, 0, 0, 0);
      const end = today;
      const prevStart = new Date(start); prevStart.setDate(start.getDate() - 30);
      const prevEnd = new Date(start); prevEnd.setDate(start.getDate() - 1); prevEnd.setHours(23, 59, 59, 999);
      return { start, end, prevStart, prevEnd, label: "Son 30 Gün" };
    }
  }
}

// ─── Bileşenler ──────────────────────────────────────────────────────────────

const STATUS_TR: Record<string, string> = {
  pending: "Bekliyor", confirmed: "Onaylandı", shipped: "Yola Çıktı",
  delivered: "Teslim Edildi", cancelled: "İptal Edildi",
};
const STATUS_COLORS: Record<string, string> = {
  "Yeni": "bg-blue-100 text-blue-700",
  "Bekliyor": "bg-gray-100 text-gray-600",
  "Hazırlanıyor": "bg-yellow-100 text-yellow-700",
  "Onaylandı": "bg-blue-100 text-blue-700",
  "Kargoya Verildi": "bg-purple-100 text-purple-700",
  "Yola Çıktı": "bg-purple-100 text-purple-700",
  "Teslim Edildi": "bg-green-100 text-green-700",
  "İptal": "bg-red-100 text-red-700",
  "İptal Edildi": "bg-red-100 text-red-700",
  "pending": "bg-gray-100 text-gray-600",
  "confirmed": "bg-blue-100 text-blue-700",
  "shipped": "bg-purple-100 text-purple-700",
  "delivered": "bg-green-100 text-green-700",
  "cancelled": "bg-red-100 text-red-700",
};

function TrendBadge({ current, prev }: { current: number; prev: number }) {
  if (prev === 0) return null;
  const pct = Math.round(((current - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mt-2 ${up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
          d={up ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
      </svg>
      {up ? "+" : ""}{pct}%
    </div>
  );
}

function StatCard({ title, value, sub, icon, color, children }: {
  title: string; value: string; sub: string; icon: React.ReactNode; color: string; children?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#ebebeb] p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#999] uppercase tracking-widest font-semibold mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#1d3435] truncate">{value}</p>
          <p className="text-[12px] text-[#999] mt-0.5">{sub}</p>
          {children}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl shadow-lg px-4 py-3 text-[13px]">
      <p className="font-semibold text-[#1d3435] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-[#666]">{p.name}:</span>
          <span className="font-bold text-[#1d3435]">
            {p.name === "Ciro (₺)" ? `₺${p.value.toLocaleString("tr-TR")}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Sayfa ───────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [preset, setPreset] = useState<Preset>("thisWeek");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(async (p: Preset) => {
    setLoading(true);
    const range = buildRange(p);
    try {
      const data = await fetchDashboardData(
        range.start.toISOString(),
        range.end.toISOString(),
        range.prevStart.toISOString(),
        range.prevEnd.toISOString(),
      );
      setStats(data);
    } catch {
      // sessizce devam et
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(preset);
    fetch("/api/products?active=false")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setProducts(d));

    const channel = supabase
      .channel("dashboard_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => loadData(preset))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => loadData(preset))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadData, preset]);

  const handlePreset = (p: Preset) => {
    setPreset(p);
    startTransition(() => { loadData(p); });
  };

  const lowStock = products.filter((p) => (p.stock ?? 0) < 5);

  const PRESETS: { key: Preset; label: string }[] = [
    { key: "thisWeek", label: "Bu Hafta" },
    { key: "lastWeek", label: "Geçen Hafta" },
    { key: "thisMonth", label: "Bu Ay" },
    { key: "last30", label: "Son 30 Gün" },
  ];

  const range = buildRange(preset);

  return (
    <div className="space-y-6">

      {/* Başlık + Tarih Filtresi */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-medium text-[#1d3435]">Genel Bakış</h1>
          <p className="text-[13px] text-[#999] mt-0.5">Performans ve satış analizi</p>
        </div>
        <div className="flex items-center gap-1 bg-[#f5f5f5] rounded-xl p-1">
          {PRESETS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePreset(key)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                preset === key
                  ? "bg-white text-[#1d3435] shadow-sm"
                  : "text-[#999] hover:text-[#1d3435]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Stat Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Teslim Edilen Ciro" sub={range.label} color="bg-[#1d3435]/10"
          value={loading ? "—" : `₺${(stats?.periodRevenue ?? 0).toLocaleString("tr-TR")}`}
          icon={
            <svg className="w-5 h-5 text-[#1d3435]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          {!loading && stats && <TrendBadge current={stats.periodRevenue} prev={stats.prevRevenue} />}
        </StatCard>

        <StatCard
          title="Sipariş" sub={range.label} color="bg-blue-50"
          value={loading ? "—" : (stats?.periodOrderCount ?? 0).toString()}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        >
          {!loading && stats && <TrendBadge current={stats.periodOrderCount} prev={stats.prevOrderCount} />}
        </StatCard>

        <StatCard
          title="Ort. Sipariş Tutarı" sub="İptal hariç" color="bg-amber-50"
          value={loading ? "—" : `₺${(stats?.avgOrderValue ?? 0).toLocaleString("tr-TR")}`}
          icon={
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        <StatCard
          title="Aktif Ürünler" sub="Sitede yayında" color="bg-[#3d7b74]/10"
          value={products.length === 0 ? "—" : products.filter((p) => p.isActive !== false).length.toString()}
          icon={
            <svg className="w-5 h-5 text-[#3d7b74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />

        <StatCard
          title="Stok Alarmı"
          value={products.length === 0 ? "—" : lowStock.length.toString()}
          sub={lowStock.length === 0 ? "Tüm stoklar yeterli" : "Kritik stok seviyesi"}
          color={lowStock.length === 0 ? "bg-green-50" : "bg-red-50"}
          icon={lowStock.length === 0
            ? <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            : <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          }
        />
      </div>

      {/* Dual-Axis Grafik + Sipariş Dağılımı Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        <div className="xl:col-span-2 bg-white rounded-xl border border-[#ebebeb] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[14px] font-bold text-[#1d3435]">Satış Trendi</h2>
              <p className="text-[12px] text-[#999]">Teslim edilen ciro (₺) ve sipariş adedi · {range.label}</p>
            </div>
            {isPending && (
              <span className="text-[11px] text-[#3d7b74] font-semibold animate-pulse">Güncelleniyor…</span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={stats?.dailySeries ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#aaa" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v: number) => v >= 1000 ? `₺${(v / 1000).toFixed(0)}k` : `₺${v}`}
                width={52}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#aaa" }}
                axisLine={false} tickLine={false}
                allowDecimals={false}
                width={24}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar yAxisId="right" dataKey="siparis" name="Sipariş" fill="#3d7b74" fillOpacity={0.18} radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="left" type="monotone" dataKey="ciro" name="Ciro (₺)"
                stroke="#1d3435" strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#1d3435", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-[#ebebeb] p-5 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-[14px] font-bold text-[#1d3435]">Sipariş Dağılımı</h2>
            <p className="text-[12px] text-[#999]">Duruma göre · {range.label}</p>
          </div>
          {!loading && (stats?.statusBreakdown?.length ?? 0) === 0 ? (
            <div className="flex flex-1 items-center justify-center text-[13px] text-[#999]">
              Bu dönemde veri yok
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={stats?.statusBreakdown ?? []}
                    cx="50%" cy="50%"
                    innerRadius={46} outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {(stats?.statusBreakdown ?? []).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "1px solid #ebebeb", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {(stats?.statusBreakdown ?? []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-[#555]">{s.name}</span>
                    </div>
                    <span className="font-bold text-[#1d3435]">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* En Çok Satanlar + Son Siparişler */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f5f5f5]">
            <div>
              <h2 className="text-[14px] font-bold text-[#1d3435]">En Çok Satanlar</h2>
              <p className="text-[12px] text-[#999]">{range.label} · satış adedi</p>
            </div>
          </div>
          {!loading && (stats?.topProducts?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <div className="w-10 h-10 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#bbb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#999]">Bu dönemde satış yok</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f9f9f9]">
              {(stats?.topProducts ?? []).map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#fafafa] transition-colors">
                  <span className="text-[11px] font-bold text-[#ccc] w-4 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1d3435] truncate">{p.name}</p>
                    <div className="mt-1.5 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#3d7b74] transition-all duration-500"
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-[#1d3435] flex-shrink-0">{p.qty} adet</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f5f5f5]">
            <h2 className="text-[14px] font-bold text-[#1d3435]">Son Siparişler</h2>
            <Link href="/admin/siparisler" className="text-[12px] text-[#3d7b74] font-semibold hover:text-[#1d3435] transition-colors">
              Tümünü Gör →
            </Link>
          </div>
          {!loading && (stats?.recentOrders?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
              <div className="w-10 h-10 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#bbb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#999]">Bu dönemde sipariş yok</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f9f9f9]">
              {(stats?.recentOrders ?? []).map((o: DashboardOrder) => (
                <div key={o.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fafafa] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#1d3435]">{o.order_number}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_TR[o.status] ?? o.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#999]">{o.customer_name} · {formatDate(o.created_at)}</p>
                  </div>
                  <span className="text-[13px] font-bold text-[#1d3435]">₺{(o.total_amount ?? 0).toLocaleString("tr-TR")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stok Alarmı + Hızlı İşlemler */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f5f5f5]">
            <h2 className="text-[14px] font-bold text-[#1d3435]">Stok Alarmı</h2>
            <Link href="/admin/urunler" className="text-[12px] text-[#3d7b74] font-semibold hover:text-[#1d3435] transition-colors">
              Ürünlere Git →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
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

        <div className="bg-white rounded-xl border border-[#ebebeb] p-5 shadow-sm">
          <h2 className="text-[14px] font-bold text-[#1d3435] mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: "/admin/urunler/yeni", label: "Yeni Ürün Ekle", primary: true, icon: "M12 4v16m8-8H4" },
              { href: "/admin/kategoriler", label: "Kategori Ekle", primary: false, icon: "M12 4v16m8-8H4" },
              { href: "/admin/kampanyalar", label: "Kupon Oluştur", primary: false, icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
              { href: "/admin/siparisler", label: "Siparişleri Gör", primary: false, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-[13px] font-semibold transition-all ${
                  a.primary
                    ? "bg-[#1d3435] text-white hover:bg-[#2a4a4b]"
                    : "border border-[#e8e8e8] text-[#1d3435] hover:border-[#1d3435] hover:bg-[#fafafa]"
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} />
                </svg>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
