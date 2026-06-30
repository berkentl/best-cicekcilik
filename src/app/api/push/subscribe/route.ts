import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const subscription = await request.json();

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: "Geçersiz subscription." }, { status: 400 });
  }

  const sb = createServerClient();
  await sb.from("push_subscriptions").upsert({
    endpoint: subscription.endpoint,
    subscription: subscription,
    updated_at: new Date().toISOString(),
  }, { onConflict: "endpoint" });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { endpoint } = await request.json();
  if (!endpoint) return NextResponse.json({ error: "endpoint gerekli" }, { status: 400 });
  const sb = createServerClient();
  await sb.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}
