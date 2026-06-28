import { createServerClient } from "@/lib/supabase-server";
import { navCategories } from "@/lib/data";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  try {
    const sb = createServerClient();
    const { data, error } = await sb
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data?.length) return navCategories;

    return data.map((row) => {
      const megaMenu =
        row.mega_menu && (row.mega_menu as unknown[]).length > 0
          ? (row.mega_menu as Category["megaMenu"])
          : navCategories.find((c) => c.slug === row.slug)?.megaMenu;

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        displayOrder: row.display_order ?? 0,
        megaMenu,
      };
    });
  } catch {
    return navCategories;
  }
}
