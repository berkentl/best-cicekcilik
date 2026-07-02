"use server";

import { createServerClient } from "@/lib/supabase-server";

export interface DashboardOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  items: { name: string; qty: number; price: number }[];
  created_at: string;
}

export interface DashboardStats {
  orders: DashboardOrder[];
  recentOrders: DashboardOrder[];
  periodRevenue: number;
  periodOrderCount: number;
  avgOrderValue: number;
  prevRevenue: number;
  prevOrderCount: number;
  statusBreakdown: { name: string; value: number; color: string }[];
  dailySeries: { label: string; ciro: number; siparis: number }[];
  topProducts: { name: string; qty: number; pct: number }[];
}

const STATUS_TR: Record<string, string> = {
  pending: "Bekliyor", confirmed: "Onaylandı", shipped: "Yola Çıktı",
  delivered: "Teslim Edildi", cancelled: "İptal Edildi",
};

const STATUS_COLORS: Record<string, string> = {
  "Teslim Edildi": "#3d7b74", "delivered": "#3d7b74",
  "Hazırlanıyor":  "#f59e0b", "confirmed": "#3b82f6",
  "Kargoya Verildi": "#8b5cf6", "shipped": "#8b5cf6",
  "Yeni":          "#3b82f6", "pending": "#9ca3af",
  "Bekliyor":      "#9ca3af",
  "İptal":         "#ef4444", "cancelled": "#ef4444",
  "İade":          "#f97316",
};

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildSeries(
  orders: DashboardOrder[],
  start: Date,
  end: Date,
): { label: string; ciro: number; siparis: number }[] {
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  const useWeekday = diffDays <= 7;

  const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const labeled = new Map<string, { label: string; ciro: number; siparis: number }>();
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = isoDay(d);
    const label = useWeekday
      ? DAYS[(d.getDay() + 6) % 7]
      : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    labeled.set(key, { label, ciro: 0, siparis: 0 });
  }

  for (const o of orders) {
    if (o.status === "İptal" || o.status === "İade") continue;
    const key = isoDay(new Date(o.created_at));
    if (labeled.has(key)) {
      labeled.get(key)!.ciro += o.total_amount ?? 0;
      labeled.get(key)!.siparis += 1;
    }
  }

  return Array.from(labeled.values());
}

export async function fetchDashboardData(
  startIso: string,
  endIso: string,
  prevStartIso: string,
  prevEndIso: string,
): Promise<DashboardStats> {
  const sb = createServerClient();

  const [ordersRes, productsRes] = await Promise.all([
    sb
      .from("orders")
      .select("id, order_number, customer_name, total_amount, status, items, created_at")
      .gte("created_at", prevStartIso)
      .order("created_at", { ascending: false }),
    sb.from("products").select("id, name, stock, is_active"),
  ]);

  const allOrders: DashboardOrder[] = (ordersRes.data ?? []) as DashboardOrder[];

  const start = new Date(startIso);
  const end = new Date(endIso);
  const prevStart = new Date(prevStartIso);
  const prevEnd = new Date(prevEndIso);

  const periodOrders = allOrders.filter((o) => {
    const d = new Date(o.created_at);
    return d >= start && d < end;
  });

  const prevOrders = allOrders.filter((o) => {
    const d = new Date(o.created_at);
    return d >= prevStart && d < prevEnd;
  });

  const activeOrders = periodOrders.filter((o) => o.status !== "İptal" && o.status !== "İade");
  const prevActiveOrders = prevOrders.filter((o) => o.status !== "İptal" && o.status !== "İade");

  // Ciro: sadece teslim edilen siparişler (siparişler sayfasıyla tutarlı)
  const deliveredOrders = activeOrders.filter((o) => o.status === "Teslim Edildi");
  const prevDeliveredOrders = prevActiveOrders.filter((o) => o.status === "Teslim Edildi");

  const periodRevenue = deliveredOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const periodOrderCount = activeOrders.length;
  const avgOrderValue = activeOrders.length > 0 ? Math.round(activeOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0) / activeOrders.length) : 0;
  const prevRevenue = prevDeliveredOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const prevOrderCount = prevActiveOrders.length;

  // Status breakdown (tüm dönem, iptal dahil)
  const statusMap: Record<string, number> = {};
  for (const o of periodOrders) {
    statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
  }
  const statusBreakdown = Object.entries(statusMap).map(([raw, value]) => {
    const name = STATUS_TR[raw] ?? raw;
    return { name, value, color: STATUS_COLORS[raw] ?? STATUS_COLORS[name] ?? "#aaa" };
  });

  // Günlük seri
  const dailySeries = buildSeries(periodOrders, start, end);

  // En çok satanlar
  const productMap: Record<string, number> = {};
  for (const o of periodOrders) {
    if (o.status === "İptal" || o.status === "İade") continue;
    const items = Array.isArray(o.items) ? o.items : [];
    for (const item of items) {
      productMap[item.name] = (productMap[item.name] ?? 0) + (item.qty ?? 1);
    }
  }
  const maxQty = Math.max(1, ...Object.values(productMap));
  const topProducts = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, qty]) => ({
      name: name.length > 32 ? name.slice(0, 30) + "…" : name,
      qty,
      pct: Math.round((qty / maxQty) * 100),
    }));

  const recentOrders = [...periodOrders].slice(0, 6);

  return {
    orders: allOrders,
    recentOrders,
    periodRevenue,
    periodOrderCount,
    avgOrderValue,
    prevRevenue,
    prevOrderCount,
    statusBreakdown,
    dailySeries,
    topProducts,
  };
}
