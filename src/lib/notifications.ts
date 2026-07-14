import { createServerClient } from "@/lib/supabase-server";

export type NotificationType = "new_order" | "out_of_stock" | "order_approved" | "order_rejected";

export async function createNotification({
  type,
  title,
  message,
  data = {},
}: {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  try {
    const sb = createServerClient();
    await sb.from("notifications").insert({ type, title, message, data });
  } catch (err) {
    console.error("[notifications] insert failed:", err);
  }
}
