import { Resend } from "resend";

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
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const itemRows = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe6;font-size:13px;color:#1d3435;">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe6;font-size:13px;color:#666;text-align:center;">×${item.qty}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe6;font-size:13px;color:#1d3435;text-align:right;font-weight:600;">₺${(item.price * item.qty).toLocaleString("tr-TR")}</td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ede8e3;">

    <!-- Header -->
    <div style="background:#1d3435;padding:32px 40px;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#6dbfb8;text-transform:uppercase;font-weight:600;">Dünyanın Çiçeği</p>
      <h1 style="margin:8px 0 0;font-size:26px;color:#fff;font-weight:500;">Siparişiniz Alındı 🌸</h1>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <p style="margin:0 0 6px;font-size:13px;color:#888;">Merhaba ${data.customerName},</p>
      <p style="margin:0 0 24px;font-size:14px;color:#1d3435;line-height:1.6;">
        Siparişiniz başarıyla alındı. Çiçeklerinizi özenle hazırlayıp belirttiğiniz adrese teslim edeceğiz.
      </p>

      <!-- Order Number -->
      <div style="background:#f5f9f8;border:1px solid #dceee8;border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <p style="margin:0;font-size:10px;color:#6dbfb8;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Sipariş Numarası</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1d3435;">${data.orderNumber}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:10px;color:#6dbfb8;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Teslimat</p>
          <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#1d3435;">${data.deliveryDate}</p>
        </div>
      </div>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr>
            <th style="padding:8px 0;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;text-align:left;border-bottom:2px solid #f0ebe6;">Ürün</th>
            <th style="padding:8px 0;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;text-align:center;border-bottom:2px solid #f0ebe6;">Adet</th>
            <th style="padding:8px 0;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#999;text-align:right;border-bottom:2px solid #f0ebe6;">Tutar</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 0 0;font-size:14px;font-weight:700;color:#1d3435;">Toplam</td>
            <td style="padding:12px 0 0;font-size:16px;font-weight:800;color:#1d3435;text-align:right;">₺${data.total.toLocaleString("tr-TR")}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Delivery Info -->
      <div style="background:#faf8f5;border-radius:12px;padding:16px 20px;margin-top:24px;font-size:13px;color:#545454;line-height:1.7;">
        <p style="margin:0 0 4px;"><strong style="color:#1d3435;">Alıcı:</strong> ${data.recipientName}</p>
        <p style="margin:0 0 4px;"><strong style="color:#1d3435;">Adres:</strong> ${data.address}</p>
        ${data.cardMessage ? `<p style="margin:8px 0 0;font-style:italic;color:#888;">"${data.cardMessage}"</p>` : ""}
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9f7f4;border-top:1px solid #ede8e3;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">Sorularınız için: <a href="tel:05322959309" style="color:#3d7b74;text-decoration:none;">0532 295 93 09</a></p>
      <p style="margin:6px 0 0;font-size:11px;color:#bbb;">dunyanincicegi.com · Şişli, İstanbul</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: "Dünyanın Çiçeği <siparis@dunyanincicegi.com>",
    to: data.to,
    subject: `Siparişiniz Alındı — ${data.orderNumber}`,
    html,
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
