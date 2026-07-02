import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";
import { requireAdmin } from "@/lib/admin-auth";

const DEFAULTS: Record<string, string> = {
  announcements:           JSON.stringify(DEFAULT_SITE_SETTINGS.announcements),
  announcement_active:     String(DEFAULT_SITE_SETTINGS.announcementActive),
  free_shipping_threshold: String(DEFAULT_SITE_SETTINGS.freeShippingThreshold),
  base_shipping_fee:       String(DEFAULT_SITE_SETTINGS.baseShippingFee),
  shipping_info:           "",
  business_name:           DEFAULT_SITE_SETTINGS.businessName,
  phone:                   DEFAULT_SITE_SETTINGS.phone,
  email:                   DEFAULT_SITE_SETTINGS.email,
  address:                 DEFAULT_SITE_SETTINGS.address,
};

export async function GET() {
  try {
    const sb = createServerClient();
    const { data, error } = await sb.from("site_settings").select("key, value");
    if (error) throw error;
    const result = { ...DEFAULTS };
    for (const row of data ?? []) result[row.key] = row.value;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(DEFAULTS);
  }
}

export async function PUT(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json() as Record<string, string>;
    const sb = createServerClient();
    const upserts = Object.entries(body).map(([key, value]) => ({ key, value }));
    const { error } = await sb
      .from("site_settings")
      .upsert(upserts, { onConflict: "key" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
