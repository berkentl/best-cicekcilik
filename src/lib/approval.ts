import { createServerClient } from "@/lib/supabase-server";
import { createNotification } from "@/lib/notifications";
import { sendPushToAdmins } from "@/lib/push";

/**
 * Görsel onay penceresi.
 *
 * Süre, yönetici fotoğrafı yükleyip linki oluşturduğu ANDA başlar — müşterinin
 * SMS'i görüp görmemesi süreyi etkilemez. Müşteriye gönderilen mesajda da
 * "15 dakikanız bulunmaktadır" yazdığı için bu değer değiştirilirse mesaj
 * metni de güncellenmelidir (bkz. api/orders/[id]/request-approval).
 */
export const APPROVAL_WINDOW_MINUTES = 15;

/**
 * Süresi dolmuş onay taleplerini otomatik onaylar.
 *
 * NEDEN GEREKLİ: Otomatik onay eskiden YALNIZCA müşterinin tarayıcısında
 * çalışıyordu — sayaç sıfıra inince sayfa kendi kendine onay isteği
 * gönderiyordu (bkz. onay/[token]/OnayClient). Müşteri linki hiç açmazsa
 * hiçbir şey olmuyor, sipariş süresiz "onay bekliyor"da kalıyor ve işletmeye
 * ne "onaylandı" ne "süre doldu" bildirimi düşüyordu. Oysa süre linkin
 * oluşturulduğu anda başlıyor; müşterinin mesajı okuması işletmenin
 * hazırlığa başlamasının koşulu değildir.
 *
 * YARIŞ KORUMASI: Güncelleme `approval_status = 'PENDING'` koşuluna bağlı ve
 * güncellenen satırlar geri okunuyor. Aynı anda çalışan iki süpürücü ya da
 * müşterinin tarayıcısıyla çakışma hâlinde siparişi yalnızca BİR taraf
 * "kapmış" olur; diğeri boş küme alır ve bildirim üretmez. Aksi hâlde aynı
 * sipariş için iki kez bildirim düşerdi.
 *
 * Hiçbir zaman fırlatmaz: bu işlev yönetici panelinin yoklama ucundan
 * çağrılıyor, bir arıza panelin sipariş listesini bozmamalı.
 */
export async function sweepExpiredApprovals(): Promise<number> {
  try {
    const sb = createServerClient();

    const { data: expired, error } = await sb
      .from("orders")
      .select("id, order_number, customer_name")
      .eq("approval_status", "PENDING")
      .not("approval_image_url", "is", null)
      .lt("approval_expires_at", new Date().toISOString())
      .limit(50);

    if (error) {
      console.error("[approval-sweep] süresi dolmuş talepler okunamadı:", error.message);
      return 0;
    }
    if (!expired?.length) return 0;

    let onaylanan = 0;

    await Promise.allSettled(
      expired.map(async (order) => {
        const { data: claimed, error: updateError } = await sb
          .from("orders")
          .update({ approval_status: "APPROVED", rejection_reason: null })
          .eq("id", order.id)
          .eq("approval_status", "PENDING")
          .select("id");

        if (updateError) {
          console.error(
            `[approval-sweep] ${order.order_number} onaylanamadı:`,
            updateError.message
          );
          return;
        }
        // Başka bir çağrı bu siparişi bizden önce kapmış — bildirim onun işi.
        if (!claimed?.length) return;

        onaylanan++;

        const müşteri = order.customer_name || "Müşteri";
        const title = "⏱️ Süre Doldu — Otomatik Onaylandı";
        const message =
          `${müşteri} — #${order.order_number} için ${APPROVAL_WINDOW_MINUTES} dakikalık ` +
          `onay süresi doldu, sipariş otomatik onaylandı.`;

        await Promise.allSettled([
          createNotification({
            type: "order_approved",
            title,
            message,
            data: { orderId: order.id, orderNumber: order.order_number, auto: true },
          }),
          sendPushToAdmins({
            title,
            body: message,
            url: "/admin/siparisler",
            tag: `approval-${order.id}`,
          }),
        ]);
      })
    );

    if (onaylanan > 0) {
      console.log(`[approval-sweep] ${onaylanan} sipariş otomatik onaylandı.`);
    }
    return onaylanan;
  } catch (err) {
    console.error("[approval-sweep] beklenmeyen hata:", err);
    return 0;
  }
}
