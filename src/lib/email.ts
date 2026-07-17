import { Resend } from "resend";
import OrderConfirmation from "@/emails/OrderConfirmation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://dunyanincicegi.com";

const BUSINESS_REPLY_TO = "durucicekorganizasyon@gmail.com";

interface OrderEmailData {
  to: string;
  customerName: string;
  orderNumber: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  address: string;
  deliveryDate: string;
  deliveryTime: string;
  recipientName: string;
  cardMessage?: string;
  siteUrl?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const origin = data.siteUrl ?? SITE_URL;

  await resend.emails.send({
    from: "Dünyanın Çiçeği <siparis@dunyanincicegi.com>",
    to: data.to,
    replyTo: BUSINESS_REPLY_TO,
    subject: `Siparişiniz Alındı — ${data.orderNumber}`,
    react: OrderConfirmation({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      items: data.items,
      total: data.total,
      address: data.address,
      deliveryDate: data.deliveryDate,
      deliveryTime: data.deliveryTime,
      recipientName: data.recipientName,
      cardMessage: data.cardMessage,
      trackingUrl: `${origin}/siparis-takip`,
      siteUrl: origin,
    }),
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ede8e3;">
    <div style="background:#1d3435;padding:32px 40px;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#6dbfb8;text-transform:uppercase;font-weight:600;">Dünyanın Çiçeği</p>
      <h1 style="margin:8px 0 0;font-size:22px;color:#fff;font-weight:500;">Şifre Sıfırlama</h1>
    </div>
    <div style="padding:36px 40px;">
      <p style="margin:0 0 20px;font-size:14px;color:#1d3435;line-height:1.6;">
        Hesabınız için bir şifre sıfırlama talebi aldık. Aşağıdaki butona tıklayarak yeni bir şifre belirleyebilirsiniz. Bu bağlantı <strong>1 saat</strong> içinde geçerliliğini kaybedecektir.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#1d3435;color:#fff;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.05em;padding:14px 32px;border-radius:10px;">ŞİFREMİ SIFIRLA</a>
      </div>
      <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
        Bu talebi siz oluşturmadıysanız bu e-postayı görmezden gelebilirsiniz, hesabınızda herhangi bir değişiklik yapılmayacaktır.
      </p>
    </div>
    <div style="background:#f9f7f4;border-top:1px solid #ede8e3;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">Sorularınız için: <a href="tel:05322959309" style="color:#3d7b74;text-decoration:none;">0532 295 93 09</a></p>
      <p style="margin:6px 0 0;font-size:11px;color:#bbb;">dunyanincicegi.com · Şişli, İstanbul</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: "Dünyanın Çiçeği <siparis@dunyanincicegi.com>",
    to,
    subject: "Dünyanın Çiçeği — Şifre Sıfırlama Talebi",
    html,
  });
}
