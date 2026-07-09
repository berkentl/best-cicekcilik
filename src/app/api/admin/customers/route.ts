import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

interface CustomerRow {
  id: string | null;
  name: string;
  email: string;
  phone: string;
  isMember: boolean;
  orders: number;
  total: number;
  joined: string;
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const sb = createServerClient();

  const [{ data: users, error: usersErr }, { data: orders, error: ordersErr }] = await Promise.all([
    sb.from("users").select("id, name, email, phone, created_at"),
    sb
      .from("orders")
      .select("email, customer_name, customer_phone, total_amount, status, created_at"),
  ]);

  if (usersErr) console.error("[admin/customers] users error:", usersErr);
  if (ordersErr) console.error("[admin/customers] orders error:", ordersErr);

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

  const customers = Array.from(map.values()).sort((a, b) => b.total - a.total);
  return NextResponse.json(customers);
}
