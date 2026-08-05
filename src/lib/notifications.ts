import { createServerClient } from "@/lib/supabase-server";

export type NotificationType =
  | "new_order"
  | "out_of_stock"
  /** Stok kritik eşiğin ALTINA yeni düştü — tükenmeden önce uyarı. */
  | "low_stock"
  | "order_approved"
  | "order_rejected"
  /** Kesilmiş fatura iptal edilemedi — mali takip gerektiren istisna. */
  | "invoice_cancel_failed"
  /** Fatura iptal edildi fakat muhasebe müdahalesi gerekiyor (geçmiş dönem / kurumsal iade). */
  | "invoice_cancel_needs_review"
  /** PayTR'nin bildirdiği tahsilat, sipariş tutarından farklı — fatura öncesi kontrol gerekir. */
  | "payment_amount_mismatch"
  /** PayTR bildirim gönderdi fakat o numarada sipariş yok — karşılıksız tahsilat riski. */
  | "payment_orphan";

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
