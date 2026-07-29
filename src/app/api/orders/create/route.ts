import { NextResponse, after } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateOrderNumber } from "@/lib/order-utils";
import { getSessionUserId } from "@/lib/auth";
import { getClientIp } from "@/lib/consent";
import { DELIVERABLE_PROVINCE } from "@/lib/turkishProvinces";
import { fulfillOrder, type FulfillableOrder } from "@/lib/order-fulfillment";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      form,
      items,
      total,
      discount,
      couponCode,
      grandTotal,
      kapidaFee,
      termsAccepted,
      termsVersions,
    } = body;

    if (!form || !items?.length) {
      return NextResponse.json({ error: "Geçersiz sipariş verisi." }, { status: 400 });
    }

    // Sözleşme onayı zorunlu — Mesafeli Sözleşmeler Yönetmeliği uyarınca
    // tüketicinin Ön Bilgilendirme Formu'nu ve Mesafeli Satış Sözleşmesi'ni
    // onayladığının ispatı satıcıya aittir. İstemci tarafındaki kutucuk
    // atlanabileceğinden burada da doğrulanır.
    if (termsAccepted !== true) {
      return NextResponse.json(
        {
          error:
            "Siparişi tamamlamak için Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ni onaylamanız gerekiyor.",
        },
        { status: 400 }
      );
    }

    // E-posta zorunlu — Kolaysoft e-Arşiv faturası müşteriye bu adrese
    // otomatik gönderiliyor, geçersiz/eksik e-posta faturanın müşteriye
    // hiç ulaşmamasına yol açar. bkz. lib/kolaysoft.ts.
    if (!form.email || !EMAIL_REGEX.test(form.email.trim())) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi girmelisiniz." },
        { status: 400 }
      );
    }

    if (form.city !== DELIVERABLE_PROVINCE) {
      return NextResponse.json(
        { error: `Şu anda yalnızca ${DELIVERABLE_PROVINCE} içine teslimat yapabiliyoruz.` },
        { status: 400 }
      );
    }

    const sb = createServerClient();
    const orderNumber = generateOrderNumber();
    const customerName = `${form.firstName} ${form.lastName}`.trim();
    const productName = items.map((i: { name: string; qty: number }) => `${i.name} (×${i.qty})`).join(", ");
    const userId = await getSessionUserId();

    // DB'ye kaydet
    const { data: order, error } = await sb.from("orders").insert({
      order_number: orderNumber,
      user_id: userId ?? null,
      email: form.email.toLowerCase().trim(),
      customer_name: customerName,
      customer_phone: form.phone,
      product_name: productName,
      items: items,
      subtotal: total,
      discount_amount: discount ?? 0,
      coupon_code: couponCode ?? null,
      shipping_fee: grandTotal - (total - (discount ?? 0)) - (kapidaFee ?? 0),
      kapida_fee: kapidaFee ?? 0,
      total_amount: grandTotal,
      address: `${form.address}, ${form.district}, ${form.city}`,
      city: form.city,
      district: form.district,
      recipient_name: form.recipientName,
      recipient_phone: form.recipientPhone,
      card_message: form.cardMessage || null,
      delivery_date: form.deliveryDate,
      delivery_time: form.deliveryTime,
      payment_method: form.paymentMethod,
      notes: form.notes || null,
      tracking_step: 0,
      status: "Yeni",
      estimated_delivery: `${form.deliveryDate} ${form.deliveryTime}`,
      // Fatura bilgileri — gerçek e-Arşiv/e-Fatura kesimi burada YAPILMAZ,
      // sadece bilgiler kaydedilir. Fatura, sipariş "Teslim Edildi" olarak
      // işaretlendiğinde admin/orders/[id]/route.ts'te kesilir (bkz. o
      // dosyadaki not — görsel onay aşamasında iptal/iade olabileceği için
      // erken fatura kesmek muhasebeyi kilitler).
      invoice_type: form.invoiceType,
      tc_kimlik_no: form.invoiceType === "bireysel" ? form.tcKimlikNo : null,
      vergi_dairesi: form.invoiceType === "kurumsal" ? form.vergiDairesi : null,
      vergi_no: form.invoiceType === "kurumsal" ? form.vergiNo : null,
      firma_adi: form.invoiceType === "kurumsal" ? form.firmaAdi : null,
      // Sipariş anında ödeme henüz alınmamıştır; bu nedenle "PENDING"
      // başlar. Havale/EFT'de işletme parayı bankada görüp siparişi
      // "Hazırlanıyor"a aldığında, kapıda ödemede ise teslim anında
      // "PAID"e geçer — bkz. admin/orders/[id]/route.ts.
      //
      // Daha önce koşulsuz "PAID" yazılıyordu; bu, parası hiç gelmemiş
      // siparişleri ödenmiş gösteriyordu ve Mesafeli Satış Sözleşmesi
      // m.6.2'deki "1 saat içinde ödeme gelmezse iptal" kaydının
      // uygulanmasını imkânsız kılıyordu.
      payment_status: "PENDING",
      // Sözleşme onayının ispat kaydı — onay anı, IP ve onaylanan metin
      // sürümleri. Uyuşmazlıkta bu kayıtlar delil teşkil eder
      // (bkz. Mesafeli Satış Sözleşmesi m.16.1 — delil sözleşmesi).
      terms_accepted_at: new Date().toISOString(),
      terms_ip: getClientIp(request),
      terms_versions: termsVersions ?? null,
    }).select().single();

    if (error) {
      console.error("[create-order] DB error:", error);
      return NextResponse.json({ error: "Sipariş kaydedilemedi." }, { status: 500 });
    }

    /*
      Stok düşümü, yönetici bildirimi, push ve müşteri e-postası KARTLA
      ÖDEMEDE burada çalışmaz.

      Kartla ödemede müşteri bu noktada henüz ödemedi: PayTR formuna
      yönlendirilecek ve orada, 3D Secure ekranında veya banka
      doğrulamasında vazgeçebilir. Bu aşamada stok düşülürse terk edilen
      her sepet stoktan kalıcı olarak eksiltir — çiçekçilikte günlük stok
      sınırlı olduğundan doğrudan satış kaybıdır. Yönetici bildirimi de
      yanıltıcı olur: işletme ödenmemiş bir sipariş için aranjman
      hazırlamaya başlar.

      Kartla ödemede bu işler PayTR bildirimi doğrulandıktan sonra
      çalıştırılır (bkz. api/payment/paytr/callback).

      Havale/EFT ve kapıda ödemede sipariş oluşturulduğu anda gerçekleşmiş
      sayılır: müşteri bilinçli bir taahhütte bulunmuştur ve işletme
      siparişi görüp stoğu ayırmak ister, para sonra gelir.

      after() kullanılmasının nedeni Vercel'in serverless ortamı: yanıt
      döndükten sonra fonksiyon donabildiği için bu işler isteğin ömrüne
      bağlanıyor, yoksa gönderim bir sonraki isteğe kadar askıda kalıyor.

      Fatura hiçbir durumda burada kesilmez — bkz. admin/orders/[id]/route.ts.
    */
    if (form.paymentMethod !== "kart") {
      const siteUrl = new URL(request.url).origin;
      after(() => fulfillOrder(order as FulfillableOrder, { siteUrl }));
    } else {
      console.log(
        `[create-order] ${orderNumber} kartla ödeme bekliyor — stok ve bildirimler tahsilat sonrasına bırakıldı.`
      );
    }

    return NextResponse.json({ orderNumber, id: order.id }, { status: 201 });
  } catch (err) {
    console.error("[create-order] unexpected:", err);
    return NextResponse.json({ error: "Beklenmedik hata." }, { status: 500 });
  }
}
