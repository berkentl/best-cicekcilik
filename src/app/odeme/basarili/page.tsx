import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { HeaderWrapper } from "@/components/HeaderWrapper";
import { Footer } from "@/components/Footer";
import { OrderSuccessClient } from "./OrderSuccessClient";
import { createServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Sipariş Alındı | Best Çiçekçilik",
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
      .select("order_number, customer_name, product_name, total_amount, tracking_step, delivery_date, delivery_time, created_at")
      .eq("order_number", orderNumber.toUpperCase())
      .maybeSingle();
    orderData = data;
  }

  return (
    <>
      <AnnouncementBar />
      <HeaderWrapper />
      <main className="flex-1">
        <OrderSuccessClient orderNumber={orderNumber} orderData={orderData} />
      </main>
      <Footer />
    </>
  );
}
