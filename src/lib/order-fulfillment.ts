import { createServerClient } from "@/lib/supabase-server";
import { createNotification } from "@/lib/notifications";
import { sendPushToAdmins } from "@/lib/push";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getPaymentSettings } from "@/lib/paymentSettings";

/**
 * Siparişin "gerçekleşmiş" sayıldığı anda çalışan yan etkiler:
 * stok düşümü, yönetici bildirimi, push ve müşteri onay e-postası.
 *
 * Bu iş bilinçli olarak sipariş kaydından ayrıldı, çünkü siparişin ne zaman
 * gerçekleştiği ödeme yöntemine göre değişiyor:
 *
 *  - **Havale/EFT ve kapıda ödeme**: sipariş oluşturulduğu anda gerçekleşmiş
 *    sayılır. Müşteri bilinçli bir taahhütte bulunmuştur, işletme siparişi
 *    görmek ve stoğu ayırmak ister. Para sonra gelir.
 *
 *  - **Kartla ödeme**: sipariş, ödeme tahsil edilene kadar gerçekleşmemiştir.
 *    Müşteri ödeme formunda, 3D Secure ekranında veya banka doğrulamasında
 *    vazgeçebilir. Bu aşamada stok düşülürse terk edilen her sepet stoktan
 *    kalıcı olarak eksiltir; çiçekçilikte günlük stok sınırlı olduğu için bu
 *    doğrudan satış kaybı demektir. Yönetici bildirimi de yanıltıcı olur:
 *    işletme ödenmemiş bir sipariş için aranjman hazırlamaya başlar.
 *
 * Bu yüzden kartla ödemede burada toplanan işler sipariş kaydında değil,
 * PayTR bildirimi doğrulandıktan sonra çalıştırılır
 * (bkz. api/payment/paytr/callback).
 */

export interface FulfillableOrder {
  id: string;
  order_number: string;
  email: string;
  customer_name: string;
  product_name?: string | null;
  items: { productId?: string; name: string; qty: number; price: number }[] | null;
  total_amount: number;
  address: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  recipient_name: string | null;
  card_message: string | null;
  payment_method: string | null;
}

/**
 * Sipariş kalemlerinin stoğunu düşer.
 *
 * is_active'e KASITLI olarak dokunulmaz — ürün sitede "Stok Yok" rozetiyle
 * görünmeye devam eder ve stok tekrar eklendiğinde otomatik satışa döner.
 * is_active yalnızca yöneticinin "Satışta" anahtarıyla kontrol ettiği ayrı
 * bir alandır.
 */
export async function decreaseStock(
  items: FulfillableOrder["items"]
): Promise<void> {
  const withId = (items ?? []).filter((i) => i.productId);
  if (withId.length === 0) return;

  const sb = createServerClient();
  const { data: products } = await sb
    .from("products")
    .select("id, name, stock")
    .in("id", withId.map((i) => i.productId!));

  if (!products?.length) return;

  await Promise.all(
    withId.map(async (item) => {
      const current = products.find((p) => p.id === item.productId);
      if (!current) return;

      const newStock = Math.max(0, (current.stock ?? 0) - item.qty);
      await sb.from("products").update({ stock: newStock }).eq("id", item.productId!);

      if (newStock === 0) {
        await createNotification({
          type: "out_of_stock",
          title: "Stok Tükendi",
          message: `"${current.name}" adlı ürünün stoğu tükendi.`,
          data: { productId: item.productId, productName: current.name },
        });
      }
    })
  );
}

/**
 * Siparişi gerçekleşmiş kabul edip tüm yan etkileri çalıştırır.
 *
 * Hiçbir zaman fırlatmaz: tek tek işler Promise.allSettled ile yürütülür,
 * böylece e-posta sağlayıcısındaki bir arıza stok düşümünü ya da yönetici
 * bildirimini engellemez.
 *
 * Fatura burada KESİNLİKLE kesilmez — fatura, sipariş "Teslim Edildi" olarak
 * işaretlendiğinde kesilir (bkz. api/admin/orders/[id]/route.ts). Görsel onay
 * aşamasında iptal/iade olabildiği için erken fatura muhasebeyi kilitler.
 */
export async function fulfillOrder(
  order: FulfillableOrder,
  opts: {
    siteUrl: string;
    /** Tahsilat doğrulandıktan sonra çağrıldıysa true (kartla ödeme). */
    paymentConfirmed?: boolean;
    /** PayTR test modunda alınan tahsilat — gerçek para hareketi yok. */
    testMode?: boolean;
  }
): Promise<void> {
  const total = Number(order.total_amount);
  const tutar = `₺${total.toLocaleString("tr-TR")}`;

  /*
    Bildirim başlığı tek bir yerde belirleniyor. Daha önce tahsilat için ayrı
    bir "Ödeme Alındı" bildirimi daha üretiliyordu; kartla ödemede ikisi
    birlikte düşüp aynı siparişi iki kez haber veriyordu.
  */
  const başlık = !opts.paymentConfirmed
    ? "Yeni Sipariş"
    : opts.testMode
      ? "Yeni Sipariş (TEST ödemesi)"
      : "Yeni Sipariş (Ödendi)";

  const ekBilgi = !opts.paymentConfirmed
    ? "."
    : opts.testMode
      ? " ve ödeme TEST modunda alındı — gerçek para hareketi yok, sipariş tahsil edilmiş sayılmaz."
      : " ve ödemesi karttan tahsil edildi.";

  await Promise.allSettled([
    decreaseStock(order.items).catch((err) =>
      console.error(`[fulfill] stok düşümü başarısız (${order.order_number}):`, err)
    ),

    createNotification({
      type: "new_order",
      title: başlık,
      message: `${order.customer_name} tarafından ${tutar} tutarında yeni sipariş oluşturuldu${ekBilgi}`,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        total,
        paymentConfirmed: opts.paymentConfirmed ?? false,
        testMode: opts.testMode ?? false,
      },
    }).catch((err) =>
      console.error(`[fulfill] bildirim başarısız (${order.order_number}):`, err)
    ),

    sendPushToAdmins({
      title: opts.paymentConfirmed
        ? opts.testMode
          ? "🧪 Yeni Sipariş — TEST ödemesi"
          : "🌸 Yeni Sipariş — Ödendi!"
        : "🌸 Yeni Sipariş!",
      body: `${order.customer_name} — ${tutar}`,
      url: "/admin/siparisler",
      tag: "new-order",
    }).catch((err) => console.error(`[fulfill] push başarısız (${order.order_number}):`, err)),

    (async () => {
      // Havale siparişlerinde hesap bilgileri e-postaya eklenir: müşterinin
      // ödeme bilgisine kalıcı olarak ulaşabileceği tek yer burasıdır.
      // Ayarlar okunamazsa e-posta yine gönderilir, yalnızca hesap bölümü çıkmaz.
      const bankTransfer =
        order.payment_method === "havale"
          ? await getPaymentSettings()
              .then((s) =>
                s.havale_enabled && s.havale_ibans.length > 0
                  ? { ibans: s.havale_ibans }
                  : undefined
              )
              .catch(() => undefined)
          : undefined;

      return sendOrderConfirmationEmail({
        to: order.email,
        customerName: order.customer_name,
        orderNumber: order.order_number,
        items: (order.items ?? []).map((i) => ({
          name: i.name,
          qty: i.qty,
          price: i.price,
        })),
        total,
        address: order.address ?? "",
        deliveryDate: order.delivery_date ?? "",
        deliveryTime: order.delivery_time ?? "",
        recipientName: order.recipient_name ?? "",
        cardMessage: order.card_message ?? undefined,
        siteUrl: opts.siteUrl,
        bankTransfer,
        // Test modundaki tahsilatta müşteriye "ödemeniz alındı" denmez;
        // gerçek bir para hareketi yok.
        cardPaymentConfirmed:
          order.payment_method === "kart" &&
          opts.paymentConfirmed === true &&
          opts.testMode !== true,
      });
    })().catch((err) =>
      console.error(`[fulfill] e-posta başarısız (${order.order_number}):`, err)
    ),
  ]);
}
