import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase-server";
import { OnayClient } from "./OnayClient";

export const metadata: Metadata = {
  title: "Siparişinizi Onaylayın | Dünyanın Çiçeği",
  robots: { index: false, follow: false },
};

// Bu sayfa daima taze veriyle (canlı onay durumu, sayaç) render edilmeli
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OnayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const sb = createServerClient();
  const { data: order } = await sb
    .from("orders")
    .select(
      "id, order_number, customer_name, approval_image_url, approval_expires_at, approval_status, rejection_reason"
    )
    .eq("approval_token", token)
    .maybeSingle();

  if (!order || !order.approval_image_url) {
    return <NotFoundScreen />;
  }

  return <OnayClient order={order} token={token} />;
}

function NotFoundScreen() {
  return (
    <main className="min-h-[100dvh] bg-[#1d3435] flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-white/8 flex items-center justify-center mx-auto mb-7">
          <svg className="w-7 h-7 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="font-cormorant text-[13px] uppercase tracking-[0.22em] text-white/50 mb-3">
          Dünyanın Çiçeği
        </p>
        <h1 className="font-heading text-2xl text-white font-medium mb-3 leading-snug">
          Sipariş Bulunamadı
        </h1>
        <p className="text-[14px] text-white/55 leading-relaxed">
          Bu onay linki geçersiz olabilir veya süresi dolmuş olabilir. Sorularınız için
          bizimle iletişime geçebilirsiniz.
        </p>
        <a
          href="https://wa.me/905322959309"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-8 text-[13px] font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-full px-6 py-3 transition-colors"
        >
          WhatsApp ile İletişime Geç
        </a>
      </div>
    </main>
  );
}
