import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * Yönetici cihazlarının push aboneliği.
 *
 * Uç YÖNETİCİ YETKİSİ İSTER. Önceden kimlik doğrulaması yoktu ve bu bir
 * bilgi sızdırma açığıydı: `sendPushToAdmins` bu tablodaki TÜM kayıtlara
 * gönderim yapıyor, bildirimler ise müşteri adı ve sipariş tutarı taşıyor
 * ("Yeni Sipariş — Ahmet Yılmaz — ₺2.450"). VAPID açık anahtarı istemci
 * paketinde herkese açık olduğundan, isteyen kendi tarayıcısından geçerli
 * bir abonelik üretip bu uca POST ederek işletmenin tüm sipariş
 * bildirimlerini almaya başlayabilirdi.
 *
 * subscribeToPush() yalnızca yönetici panelinden çağrıldığı için yetki
 * şartının müşteri tarafına etkisi yok (bkz. components/admin/AdminNotifications).
 */

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const subscription = await request.json();

  if (!subscription?.endpoint || typeof subscription.endpoint !== "string") {
    return NextResponse.json({ error: "Geçersiz subscription." }, { status: 400 });
  }

  const sb = createServerClient();
  const { error } = await sb.from("push_subscriptions").upsert(
    {
      endpoint: subscription.endpoint,
      subscription: subscription,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    console.error("[push/subscribe] kaydedilemedi:", error.message);
    return NextResponse.json({ error: "Abonelik kaydedilemedi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { endpoint } = await request.json();
  if (!endpoint) return NextResponse.json({ error: "endpoint gerekli" }, { status: 400 });

  const sb = createServerClient();
  const { error } = await sb.from("push_subscriptions").delete().eq("endpoint", endpoint);

  if (error) {
    console.error("[push/subscribe] silinemedi:", error.message);
    return NextResponse.json({ error: "Abonelik silinemedi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
