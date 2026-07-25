import { marked } from "marked";
import {
  mesafeliSatisSozlesmesi,
  onBilgilendirmeFormu,
  type LegalDocument,
} from "@/content/legal";

/**
 * Sipariş onay e-postasına iliştirilecek sözleşme nüshalarını üretir.
 *
 * Mesafeli Sözleşmeler Yönetmeliği, sözleşmenin tüketiciye "yazılı olarak
 * veya kalıcı veri saklayıcısı ile" verilmesini emreder. Siteye bağlantı
 * vermek bu şartı KARŞILAMAZ; sitedeki metin sonradan değişebileceğinden
 * tüketicinin onayladığı nüshanın kendisi kendisine ulaştırılmalıdır.
 *
 * Bu nedenle metinler e-postaya ek dosya olarak iliştirilir; e-posta
 * ekinin kendisi kalıcı veri saklayıcısı niteliğindedir.
 */

/**
 * Markdown içeriği, e-posta ekinde açılabilecek bağımsız bir HTML belgesine
 * dönüştürür.
 *
 * Sayfa render'ında kullanılan react-markdown burada KULLANILAMAZ: React
 * bileşenini string'e çevirmek için react-dom/server gerekir ve Next.js
 * uygulama kodunda bu paketin import edilmesine izin vermez (üretim
 * derlemesi hata verir). Bu nedenle düz bir markdown→HTML dönüştürücü
 * (marked) kullanılıyor.
 */
function toStandaloneHtml(doc: LegalDocument): string {
  // GFM tablo desteği gerekiyor — metinler yoğun biçimde tablo içeriyor.
  // async: false ile senkron string dönüşü garanti ediliyor.
  const bodyHtml = marked.parse(doc.content, { gfm: true, async: false });

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${doc.title} — Dünyanın Çiçeği</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
         max-width: 800px; margin: 0 auto; padding: 32px 20px 64px; color: #2c3333; line-height: 1.7; font-size: 15px; }
  h1 { font-size: 24px; color: #1d3435; margin: 0 0 4px; }
  h2 { font-size: 19px; color: #1d3435; margin: 40px 0 14px; padding-bottom: 6px; border-bottom: 1px solid #e6e1da; }
  h3 { font-size: 16px; color: #1d3435; margin: 28px 0 10px; }
  h4 { font-size: 15px; color: #1d3435; margin: 20px 0 8px; }
  p { margin: 0 0 12px; }
  ul, ol { margin: 0 0 16px; padding-left: 22px; }
  li { margin-bottom: 6px; }
  table { border-collapse: collapse; width: 100%; margin: 18px 0; font-size: 13.5px; }
  th, td { border: 1px solid #e0dbd4; padding: 8px 11px; text-align: left; vertical-align: top; }
  th { background: #f4f1ec; }
  blockquote { margin: 18px 0; padding: 12px 16px; background: #f6f4f0; border-radius: 6px; }
  hr { border: 0; border-top: 1px solid #e6e1da; margin: 32px 0; }
  code { background: #f0ece6; padding: 2px 5px; border-radius: 3px; font-size: 13px; }
  a { color: #3d7b74; }
  .meta { color: #8a8580; font-size: 13px; margin: 0 0 28px; }
</style>
</head>
<body>
<h1>${doc.title}</h1>
<p class="meta">Sürüm ${doc.version}${doc.updatedAt ? ` &middot; ${doc.updatedAt}` : ""} &middot; DURU DAVET ORGANİZASYON VE ÇİÇEKÇİLİK TİCARET LİMİTED ŞİRKETİ</p>
${bodyHtml}
</body>
</html>`;
}

export interface EmailAttachment {
  filename: string;
  content: string; // base64
}

/**
 * Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi nüshalarını
 * e-posta eki biçiminde döner. Üretim sırasında hata oluşursa boş dizi
 * döner — ek üretilemezse sipariş onay e-postası yine gönderilir.
 */
export function buildLegalAttachments(orderNumber: string): EmailAttachment[] {
  try {
    const docs: Array<[LegalDocument, string]> = [
      [onBilgilendirmeFormu, "On-Bilgilendirme-Formu"],
      [mesafeliSatisSozlesmesi, "Mesafeli-Satis-Sozlesmesi"],
    ];

    return docs.map(([doc, adPrefix]) => ({
      filename: `${adPrefix}-${orderNumber}.html`,
      content: Buffer.from(toStandaloneHtml(doc), "utf8").toString("base64"),
    }));
  } catch (err) {
    console.error("[email] sözleşme ekleri üretilemedi:", err);
    return [];
  }
}
