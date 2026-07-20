import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAggregatedCustomers } from "@/lib/customers";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const customers = await getAggregatedCustomers();
  return NextResponse.json(customers);
}
