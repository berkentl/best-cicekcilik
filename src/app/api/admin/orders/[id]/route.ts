import { NextResponse, after } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/admin-auth";
import { createKolaysoftInvoice, mapOrderToKolaysoftInvoice } from "@/lib/kolaysoft";
import { sendSMS } from "@/lib/netgsm";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

const DELIVERED_STATUS = "Teslim Edildi";
const OUT_FOR_DELIVERY_STATUS = "Kargoya Verildi";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { status, tracking_number, tracking_step, courier_name, courier_phone } = body;

  const STATUS_TO_STEP: Record<string, number> = {
    "Yeni": 0,
    "Hazırlanıyor": 1,
    "Kargoya Verildi": 2,
    "Teslim Edildi": 3,
    "İptal": 0,
    "İade": 0,
  };

  const sb = createServerClient();

  // Fatura kesimi "Teslim Edildi"ye YENİ geçişte bir kez tetiklenmeli — bunu
  // tespit etmek için güncellemeden önce mevcut durumu okuyoruz.
  let previousStatus: string | null = null;
  let previousInvoiceStatus: string | null = null;
  if (status !== undefined) {
    const { data: existing } = await sb
      .from("orders")
      .select("status, invoice_status")
      .eq("id", id)
      .maybeSingle();
    previousStatus = existing?.status ?? null;
    previousInvoiceStatus = existing?.invoice_status ?? null;
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status !== undefined) {
    updates.status = status;
    updates.tracking_step = STATUS_TO_STEP[status] ?? 0;
  }
  if (tracking_number !== undefined) updates.tracking_number = tracking_number;
  if (tracking_step !== undefined) updates.tracking_step = tracking_step;
  if (courier_name !== undefined) updates.courier_name = courier_name;
  if (courier_phone !== undefined) updates.courier_phone = courier_phone;

  const { data, error } = await sb
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/orders/patch] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fatura kesme — SADECE sipariş "Teslim Edildi"ye yeni geçtiğinde ve daha
  // önce fatura kesilmemişse tetiklenir. Sipariş oluşturulduğunda veya ödeme
  // alındığında KESİNLİKLE tetiklenmez (çiçekçilikte görsel onay aşamasında
  // müşteri iptal/iade isteyebilir — erken kesilen fatura muhasebeyi kilitler).
  const justDelivered = status === DELIVERED_STATUS && previousStatus !== DELIVERED_STATUS;
  const alreadyInvoiced = previousInvoiceStatus === "ISSUED";

  if (justDelivered && !alreadyInvoiced) {
    after(async () => {
      const invoiceInput = mapOrderToKolaysoftInvoice({
        orderNumber: data.order_number,
        invoiceType: (data.invoice_type as "bireysel" | "kurumsal") ?? "bireysel",
        customerName: data.customer_name,
        customerEmail: data.email,
        customerPhone: data.customer_phone,
        tcKimlikNo: data.tc_kimlik_no,
        vergiDairesi: data.vergi_dairesi,
        vergiNo: data.vergi_no,
        firmaAdi: data.firma_adi,
        address: data.address,
        city: data.city,
        district: data.district,
        items: (data.items as OrderItem[]) ?? [],
      });

      const result = await createKolaysoftInvoice(invoiceInput);

      if (result.success) {
        console.log(`[kolaysoft] fatura kesildi — sipariş ${data.order_number}: ${result.invoiceNumber ?? result.ettn}`);
      } else {
        console.error(`[kolaysoft] fatura kesilemedi — sipariş ${data.order_number}:`, result.error);
      }

      await sb
        .from("orders")
        .update({
          invoice_status: result.success ? "ISSUED" : "FAILED",
          invoice_number: result.invoiceNumber ?? null,
          invoice_ettn: result.ettn ?? null,
          invoice_pdf_url: result.pdfUrl ?? null,
          invoice_error: result.success ? null : (result.error ?? "Bilinmeyen hata."),
        })
        .eq("id", id);
    });
  }

  // Kurye SMS'i — sadece sipariş "Kargoya Verildi"ye YENİ geçtiğinde bir kez
  // tetiklenir. SMS başarısız olsa bile (bkz. lib/netgsm.ts — asla exception
  // fırlatmaz) sipariş durumu zaten yukarıda güncellenmiş olduğundan akış
  // etkilenmez, hata sadece konsola loglanır.
  const justShipped = status === OUT_FOR_DELIVERY_STATUS && previousStatus !== OUT_FOR_DELIVERY_STATUS;

  if (justShipped && data.customer_phone) {
    after(async () => {
      const message =
        `Sayın ${data.customer_name}, ${data.order_number} numaralı çiçek siparişiniz kuryemize ` +
        `teslim edilmiştir ve yola çıkmıştır. Bizi tercih ettiğiniz için teşekkür ederiz.`;

      const result = await sendSMS(data.customer_phone, message);

      if (result.success) {
        console.log(`[netgsm] kurye SMS'i gönderildi — sipariş ${data.order_number}`);
      } else {
        console.error(`[netgsm] kurye SMS'i gönderilemedi — sipariş ${data.order_number}:`, result.error);
      }
    });
  }

  return NextResponse.json(data);
}
