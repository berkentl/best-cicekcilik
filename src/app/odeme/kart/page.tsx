import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createServerClient } from "@/lib/supabase-server";
import { createPaytrToken, type BasketLine } from "@/lib/paytr";
import { siteConfig } from "@/lib/data";
import { PaytrCheckoutFrame } from "./PaytrCheckoutFrame";

export const metadata: Metadata = {
  title: "Kart ile Ödeme | Dünyanın Çiçeği",
  // Ödeme sayfası hiçbir arama motorunda indekslenmemeli.
  robots: { index: false, follow: false },
};

/**
 * Duyuru şeridi bilinçli olarak bu sayfada yok: kart bilgisi girilirken
 * ekranın üstünde dönen bir pazarlama şeridi dikkat dağıtıyor ve ödeme
 * adımında terk oranını artırıyor.
 */

interface OrderRow {
  id: string;
  order_number: string;
  email: string;
  customer_name: string;
  customer_phone: string | null;
  address: string | null;
  items: { name: string; qty: number; price: number }[] | null;
  subtotal: number | null;
  discount_amount: number | null;
  shipping_fee: number | null;
  total_amount: number;
  payment_status: string | null;
  payment_method: string | null;
}

/**
 * Sepeti PayTR ödeme ekranında gösterilecek satırlara çevirir.
 *
 * Satırların toplamı tahsil edilecek tutara eşit olmak zorundadır; aksi hâlde
 * müşteri ödeme ekranında bir tutar, sipariş özetinde başka bir tutar görür.
 * Bu nedenle teslimat ücreti ve indirim de birer satır olarak ekleniyor.
 */
function buildBasket(order: OrderRow): BasketLine[] {
  const lines: BasketLine[] = (order.items ?? []).map((item) => ({
    name: item.name,
    unitPrice: item.price,
    qty: item.qty,
  }));

  const shipping = Number(order.shipping_fee ?? 0);
  if (shipping > 0) {
    lines.push({ name: "Teslimat Ücreti", unitPrice: shipping, qty: 1 });
  }

  const discount = Number(order.discount_amount ?? 0);
  if (discount > 0) {
    lines.push({ name: "İndirim", unitPrice: -discount, qty: 1 });
  }

  // Sepet hiç satır üretemediyse (eski/bozuk kayıt) tek satırlık özet gönder;
  // boş sepetle token isteği PayTR tarafından reddedilir.
  if (lines.length === 0) {
    lines.push({
      name: `Sipariş ${order.order_number}`,
      unitPrice: Number(order.total_amount),
      qty: 1,
    });
  }

  return lines;
}

function ErrorPanel({ title, detail, orderNumber }: { title: string; detail: string; orderNumber?: string }) {
  return (
    <div className="max-w-xl mx-auto bg-white border border-[#e8e8e8] rounded-sm p-6 md:p-8">
      <h1 className="font-sans text-[18px] font-bold text-[#1d3435] mb-3">{title}</h1>
      <p className="text-[14px] text-[#545454] leading-relaxed mb-5">{detail}</p>

      {orderNumber && (
        <p className="text-[13px] text-[#545454] mb-5">
          Sipariş numaranız:{" "}
          <span className="font-semibold text-[#1d3435] tracking-wide">{orderNumber}</span>
        </p>
      )}

      <div className="border-t border-[#f0f0f0] pt-5 space-y-2 text-[13px] text-[#545454]">
        <p className="font-semibold text-[#1d3435]">Bize ulaşın</p>
        <p>
          Telefon / WhatsApp:{" "}
          <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="text-[#3d7b74] hover:underline">
            {siteConfig.phone}
          </a>
        </p>
        <p>
          E-posta:{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-[#3d7b74] hover:underline">
            {siteConfig.email}
          </a>
        </p>
      </div>

      <Link
        href="/sepet"
        className="inline-block mt-6 text-[13px] font-semibold text-[#3d7b74] hover:underline"
      >
        ← Sepete dön
      </Link>
    </div>
  );
}

export default async function CardPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; hata?: string }>;
}) {
  const { order: orderNumber, hata } = await searchParams;

  if (!orderNumber) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-[#faf8f5] py-12 md:py-16">
          <div className="container-site">
            <ErrorPanel
              title="Sipariş bulunamadı"
              detail="Ödeme sayfasına sipariş numarası olmadan ulaşıldı. Lütfen sepetinizden siparişinizi yeniden oluşturun."
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const sb = createServerClient();
  const { data: order } = await sb
    .from("orders")
    .select(
      "id, order_number, email, customer_name, customer_phone, address, items, subtotal, discount_amount, shipping_fee, total_amount, payment_status, payment_method"
    )
    .eq("order_number", orderNumber)
    .maybeSingle<OrderRow>();

  if (!order) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-[#faf8f5] py-12 md:py-16">
          <div className="container-site">
            <ErrorPanel
              title="Sipariş bulunamadı"
              detail={`"${orderNumber}" numaralı bir sipariş kaydı bulunamadı. Numarayı kontrol edip tekrar deneyin.`}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Ödeme tamamlanmışsa formu tekrar açmıyoruz — müşteri geri tuşuyla bu
  // sayfaya dönerse ikinci kez ödeme yapmaya çalışabilir.
  if (order.payment_status === "PAID") {
    redirect(`/odeme/basarili?order=${order.order_number}`);
  }

  // Kart dışı ödeme yöntemiyle oluşturulmuş siparişler için kart formu
  // açılmaz; onay sayfası havale bilgilerini zaten gösteriyor.
  if (order.payment_method !== "kart") {
    redirect(`/odeme/basarili?order=${order.order_number}`);
  }

  const h = await headers();
  const userIp =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "127.0.0.1";

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    `https://${h.get("host") ?? "dunyanincicegi.com"}`;

  const tokenResult = await createPaytrToken({
    merchantOid: order.order_number,
    email: order.email,
    amount: Number(order.total_amount),
    basket: buildBasket(order),
    userIp,
    userName: order.customer_name,
    userAddress: order.address ?? "-",
    userPhone: order.customer_phone ?? "-",
    okUrl: `${origin}/odeme/basarili?order=${order.order_number}`,
    failUrl: `${origin}/odeme/kart?order=${order.order_number}&hata=1`,
  });

  if (!tokenResult.ok) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-[#faf8f5] py-12 md:py-16">
          <div className="container-site">
            <ErrorPanel
              title="Ödeme sayfası açılamadı"
              detail="Kartla ödeme altyapısına şu anda ulaşılamıyor. Siparişiniz kaydedildi; bizimle iletişime geçerek havale/EFT ile ödeme yapabilir veya birkaç dakika sonra tekrar deneyebilirsiniz."
              orderNumber={order.order_number}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#faf8f5] py-8 md:py-12">
        <div className="container-site">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-sans text-2xl md:text-3xl text-[#1d3435] font-bold tracking-[-0.02em] mb-2">
              Kart ile Ödeme
            </h1>
            <p className="text-[14px] text-[#545454] mb-6">
              <span className="text-[#1d3435] font-semibold tracking-wide">{order.order_number}</span>{" "}
              numaralı siparişiniz için{" "}
              <span className="text-[#1d3435] font-semibold">
                ₺{Number(order.total_amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>{" "}
              tahsil edilecek.
            </p>

            {tokenResult.testMode && (
              <div className="mb-6 border border-amber-300 bg-amber-50 rounded-sm px-4 py-3">
                <p className="text-[13px] font-semibold text-amber-900 mb-1">
                  Test modu etkin
                </p>
                <p className="text-[13px] text-amber-800 leading-relaxed">
                  Bu ödeme PayTR test ortamında yapılır, gerçek bir para hareketi
                  oluşmaz ve sipariş tahsil edilmiş sayılmaz.
                </p>
              </div>
            )}

            {hata === "1" && (
              <div className="mb-6 border border-red-200 bg-red-50 rounded-sm px-4 py-3">
                <p className="text-[13px] font-semibold text-red-900 mb-1">
                  Ödeme tamamlanamadı
                </p>
                <p className="text-[13px] text-red-800 leading-relaxed">
                  Kartınızdan tahsilat yapılamadı. Kart bilgilerinizi kontrol edip
                  tekrar deneyebilir veya başka bir kart kullanabilirsiniz. Siparişiniz
                  iptal edilmedi.
                </p>
              </div>
            )}

            <div className="bg-white border border-[#e8e8e8] rounded-sm overflow-hidden">
              <PaytrCheckoutFrame token={tokenResult.token} />
            </div>

            <p className="text-[12px] text-[#8a8a8a] leading-relaxed mt-4">
              Ödeme formu PayTR Ödeme Kuruluşu tarafından sağlanmaktadır. Kart
              bilgileriniz Dünyanın Çiçeği sunucularına iletilmez ve tarafımızca
              saklanmaz.
            </p>

            <p className="text-[12px] text-[#8a8a8a] mt-3">
              Sorun yaşarsanız{" "}
              <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="text-[#3d7b74] hover:underline">
                {siteConfig.phone}
              </a>{" "}
              numarasından bize ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
