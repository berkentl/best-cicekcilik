import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { OrderSuccessClient } from "./OrderSuccessClient";
import { createServerClient } from "@/lib/supabase-server";
import { getPaymentSettings } from "@/lib/paymentSettings";

export const metadata: Metadata = {
  title: "Sipariş Alındı | Dünyanın Çiçeği",
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  let orderData = null;
  if (orderNumber) {
    const sb = createServerClient();
    const { data } = await sb
      .from("orders")
      .select("order_number, customer_name, product_name, total_amount, tracking_step, delivery_date, delivery_time, created_at, payment_method, payment_status")
      .eq("order_number", orderNumber.toUpperCase())
      .maybeSingle();
    orderData = data;
  }

  // Havale/EFT ile ödenecek ve ödemesi henüz alınmamış siparişlerde hesap
  // bilgileri burada gösterilir: müşterinin sipariş numarasını ilk kez
  // gördüğü yer bu sayfa, dolayısıyla ödemeyi yapabileceği tek yer de burası.
  const havaleBekliyor =
    orderData?.payment_method === "havale" && orderData?.payment_status !== "PAID";
  const paymentSettings = havaleBekliyor ? await getPaymentSettings() : null;

  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main className="flex-1">
        <OrderSuccessClient
          orderNumber={orderNumber}
          orderData={orderData}
          havaleIbans={
            havaleBekliyor && paymentSettings?.havale_enabled
              ? paymentSettings.havale_ibans
              : []
          }
        />
      </main>
      <Footer />
    </>
  );
}
