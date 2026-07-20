import { createServerClient } from "@/lib/supabase-server";

export interface CustomerRow {
  id: string | null;
  name: string;
  email: string;
  phone: string;
  isMember: boolean;
  orders: number;
  total: number;
  joined: string;
}

/** Üye (`users`) ve misafir (`orders`) kayıtlarını e-postaya göre birleştirip tek bir müşteri listesi üretir. */
export async function getAggregatedCustomers(): Promise<CustomerRow[]> {
  const sb = createServerClient();

  const [{ data: users, error: usersErr }, { data: orders, error: ordersErr }] = await Promise.all([
    sb.from("users").select("id, name, email, phone, created_at"),
    sb
      .from("orders")
      .select("email, customer_name, customer_phone, total_amount, status, created_at"),
  ]);

  if (usersErr) console.error("[customers] users error:", usersErr);
  if (ordersErr) console.error("[customers] orders error:", ordersErr);

  const map = new Map<string, CustomerRow>();

  for (const u of users ?? []) {
    const email = String(u.email ?? "").toLowerCase().trim();
    if (!email) continue;
    map.set(email, {
      id: u.id,
      name: u.name || email,
      email,
      phone: u.phone || "—",
      isMember: true,
      orders: 0,
      total: 0,
      joined: u.created_at,
    });
  }

  for (const o of orders ?? []) {
    const email = String(o.email ?? "").toLowerCase().trim();
    if (!email) continue;
    const isCancelled = o.status === "İptal" || o.status === "cancelled";
    const existing = map.get(email);

    if (existing) {
      existing.orders += 1;
      if (!isCancelled) existing.total += o.total_amount ?? 0;
      if (!existing.isMember && new Date(o.created_at) < new Date(existing.joined)) {
        existing.joined = o.created_at;
      }
    } else {
      map.set(email, {
        id: null,
        name: o.customer_name || email,
        email,
        phone: o.customer_phone || "—",
        isMember: false,
        orders: 1,
        total: isCancelled ? 0 : (o.total_amount ?? 0),
        joined: o.created_at,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}
