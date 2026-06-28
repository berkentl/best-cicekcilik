import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

function mapCategory(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    displayOrder: row.display_order ?? 0,
    megaMenu: (row.mega_menu as unknown[]) ?? [],
  };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const sb = createServerClient();
    const { data, error } = await sb
      .from("categories")
      .update({
        name: body.name,
        slug: body.slug,
        display_order: body.displayOrder ?? 0,
        mega_menu: body.megaMenu ?? [],
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapCategory(data));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sb = createServerClient();
    const { error } = await sb.from("categories").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
