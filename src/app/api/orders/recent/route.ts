import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * Yönetici panelinin "yeni sipariş" akışı.
 *
 * Panel bu ucu 15 saniyede bir yokluyor ve daha önce görmediği her sipariş
 * kimliği için sesli uyarı, sayfa içi bildirim ve tarayıcı bildirimi
 * üretiyor (bkz. components/admin/AdminNotifications.tsx). Yani bu uç,
 * "sipariş ne zaman haber verilmeye değer" sorusunun cevabıdır.
 *
 * Ödemesi alınmamış kart siparişleri BİLİNÇLİ olarak dışarıda bırakılıyor.
 * Aksi hâlde iki bildirim mekanizması birbiriyle çelişiyordu:
 *
 *  - Web Push (sunucudan, tahsilat sonrası) telefona gidiyordu.
 *  - Bu yoklama ise panel açık olan bilgisayarda, sipariş henüz
 *    OLUŞTUĞU anda uyarı veriyordu — ödeme yapılmasa bile.
 *
 * Dahası, bilgisayar o sipariş kimliğini "görüldü" olarak işaretlediği için
 * ödeme daha sonra tamamlandığında bir daha uyarı vermiyordu. Sonuç: ödeme
 * yapılmadan bilgisayar haber veriyor, ödeme yapıldığında ise sessiz
 * kalıyordu — tam tersi.
 *
 * Kart siparişi bu akışa ancak tahsilat doğrulandığında girer; o an panel
 * için "yeni" görünür ve uyarı orada üretilir.
 */
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const sb = createServerClient();
  const { data, error } = await sb
    .from("orders")
    .select(
      "id, order_number, customer_name, total_amount, payment_method, payment_status, status, created_at, paid_at"
    )
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    console.error(`[orders/recent] okunamadı: ${error.message}`);
    return NextResponse.json({ orders: [] });
  }

  const odemeBekleyenKart = (o: { payment_method: string | null; payment_status: string | null; status: string }) =>
    o.payment_method === "kart" &&
    o.payment_status !== "PAID" &&
    o.status !== "İptal" &&
    o.status !== "İade";

  /*
    Sıralama, siparişin oluşturulma anına değil PANELE GÖRÜNÜR OLDUĞU ana
    göre yapılıyor: kartla ödemede bu an paid_at, diğerlerinde created_at.

    Aksi hâlde şu kaçırılıyordu: kart siparişi verilir, ödeme birkaç dakika
    sonra tamamlanır, o arada başka siparişler gelir. Sipariş oluşturulma
    tarihine göre sıralandığı için listenin ilk onunun dışına düşer ve panel
    onu hiç "yeni" olarak görmez — yoğun günlerde tahsil edilmiş bir sipariş
    sessizce gözden kaçar.
  */
  const orders = (data ?? [])
    .filter((o) => !odemeBekleyenKart(o))
    .sort(
      (a, b) =>
        new Date(b.paid_at ?? b.created_at).getTime() -
        new Date(a.paid_at ?? a.created_at).getTime()
    )
    .slice(0, 10)
    .map(({ id, order_number, customer_name, total_amount }) => ({
      id,
      order_number,
      customer_name,
      total_amount,
    }));

  return NextResponse.json({ orders });
}
