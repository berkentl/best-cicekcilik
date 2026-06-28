import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { navCategories } from "@/lib/data";

export async function GET() {
  try {
    const sb = createServerClient();
    const { data, error } = await sb
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return NextResponse.json((data ?? []).map(mapCategory));
  } catch {
    return NextResponse.json(navCategories);
  }
}

function mapCategory(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    displayOrder: row.display_order ?? 0,
    megaMenu: (row.mega_menu as unknown[]) ?? [],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sb = createServerClient();
    const { data, error } = await sb
      .from("categories")
      .insert({
        name: body.name,
        slug: body.slug,
        display_order: body.displayOrder ?? 0,
        mega_menu: body.megaMenu ?? [],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapCategory(data));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
