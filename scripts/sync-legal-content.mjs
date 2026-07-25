#!/usr/bin/env node
/**
 * docs/legal/*.md dosyalarını okuyup src/content/legal.ts dosyasını üretir.
 *
 * Yasal metinlerin tek kaynağı docs/legal/ altındaki markdown dosyalarıdır.
 * Metin güncellendiğinde bu betiği çalıştırmak yeterlidir:
 *
 *   node scripts/sync-legal-content.mjs
 *
 * Metinlerin doğrudan .md dosyasından çalışma zamanında okunmaması bilinçli:
 * serverless dağıtımda proje dosyalarına fs ile erişim güvenilir değildir.
 * Üretilen TS dosyası derlemeye dâhil olduğu için bu sorun doğmaz.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LEGAL_DIR = join(ROOT, "docs", "legal");
const OUT_FILE = join(ROOT, "src", "content", "legal.ts");

/**
 * Dosya adı → sayfa slug'ı ve başlık eşlemesi.
 * Buradaki slug, src/app altındaki route klasör adıyla birebir aynı olmalıdır.
 */
const DOCS = [
  {
    file: "01-mesafeli-satis-sozlesmesi.md",
    key: "mesafeliSatisSozlesmesi",
    slug: "mesafeli-satis-sozlesmesi",
    title: "Mesafeli Satış Sözleşmesi",
    description:
      "Dünyanın Çiçeği üzerinden verilen siparişlere ilişkin mesafeli satış sözleşmesi.",
  },
  {
    file: "02-on-bilgilendirme-formu.md",
    key: "onBilgilendirmeFormu",
    slug: "on-bilgilendirme-formu",
    title: "Ön Bilgilendirme Formu",
    description:
      "Mesafeli Sözleşmeler Yönetmeliği uyarınca sipariş öncesi bilgilendirme formu.",
  },
  {
    file: "03-iptal-ve-iade-kosullari.md",
    key: "iptalVeIadeKosullari",
    slug: "iade",
    title: "İptal ve İade Koşulları",
    description:
      "Sipariş iptali, cayma hakkı, ürün iadesi ve ayıplı ürün başvurularına ilişkin koşullar.",
  },
  {
    file: "04-uyelik-sozlesmesi-ve-kullanim-kosullari.md",
    key: "uyelikSozlesmesi",
    slug: "kullanim-kosullari",
    title: "Üyelik Sözleşmesi ve Kullanım Koşulları",
    description:
      "Site kullanımı ve üyelik hesabına ilişkin hak ve yükümlülükler.",
  },
  {
    file: "05-kvkk-aydinlatma-metni.md",
    key: "kvkkAydinlatmaMetni",
    slug: "kvkk",
    title: "KVKK Aydınlatma Metni",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
  },
  {
    file: "06-acik-riza-metni.md",
    key: "acikRizaMetni",
    slug: "acik-riza-metni",
    title: "Açık Rıza Metni",
    description:
      "Yurt dışına veri aktarımı ve pazarlama amaçlı veri işlemeye ilişkin açık rıza metni.",
  },
  {
    file: "07-ticari-elektronik-ileti-onay-metni.md",
    key: "ticariElektronikIleti",
    slug: "ticari-elektronik-ileti",
    title: "Ticari Elektronik İleti Onay Metni",
    description:
      "Kampanya ve duyuru içerikli ticari elektronik iletilere ilişkin onay metni.",
  },
  {
    file: "08-gizlilik-ve-cerez-politikasi.md",
    key: "gizlilikVeCerezPolitikasi",
    slug: "gizlilik",
    title: "Gizlilik ve Çerez Politikası",
    description: "Sitede kullanılan çerezler ve benzeri teknolojiler hakkında bilgi.",
  },
  {
    file: "09-teslimat-bilgileri.md",
    key: "teslimatBilgileri",
    slug: "teslimat",
    title: "Teslimat Bilgileri",
    description:
      "Teslimat bölgeleri, saatleri, aynı gün teslimat koşulları ve teslimat ücreti.",
  },
];

/**
 * "Son güncelleme: 25.07.2026" veya "... — Sürüm: 1.0" satırından
 * tarih ve sürüm bilgisini çıkarır. Sürüm, onay kayıtlarında
 * (consent_logs.text_version) hangi metne onay verildiğini ispat eder.
 */
function parseMeta(markdown) {
  const dateMatch = markdown.match(/Son güncelleme:\s*([0-9]{2}\.[0-9]{2}\.[0-9]{4})/);
  const versionMatch = markdown.match(/Sürüm:\s*([0-9]+\.[0-9]+)/);
  return {
    updatedAt: dateMatch ? dateMatch[1] : null,
    version: versionMatch ? versionMatch[1] : "1.0",
  };
}

/** Markdown içeriğini TS template literal'ine güvenli biçimde gömer. */
function escapeForTemplateLiteral(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

const available = new Set(readdirSync(LEGAL_DIR));
const missing = DOCS.filter((d) => !available.has(d.file));
if (missing.length > 0) {
  console.error("Eksik dosyalar:\n" + missing.map((m) => "  - " + m.file).join("\n"));
  process.exit(1);
}

const entries = DOCS.map((doc) => {
  const raw = readFileSync(join(LEGAL_DIR, doc.file), "utf8");

  // Uygulama gerekliliklerini içeren EK bölümleri yayımlanan sayfaya
  // dâhil edilmez — bunlar geliştirici notudur, tüketiciye gösterilmez.
  const publicPart = raw.split(/\n# EK — (?:ARAYÜZ )?UYGULAMA GEREKLİLİKLERİ/)[0].trimEnd();

  const meta = parseMeta(raw);
  return { ...doc, meta, content: publicPart };
});

const header = `// BU DOSYA OTOMATİK ÜRETİLMİŞTİR — ELLE DÜZENLEMEYİN.
//
// Kaynak: docs/legal/*.md
// Yeniden üretmek için: node scripts/sync-legal-content.mjs
//
// Yasal metinlerin tek kaynağı docs/legal/ altındaki markdown dosyalarıdır.
// Bir metni güncellemek için ilgili .md dosyasını düzenleyip betiği yeniden
// çalıştırın. Metin içeriği değiştiğinde "Sürüm" satırını da yükseltin —
// onay kayıtları (consent_logs.text_version) bu sürüme atıf yapar.

export interface LegalDocument {
  /** URL yolu — src/app altındaki route klasörüyle aynı */
  slug: string;
  title: string;
  description: string;
  /** Sayfa altında gösterilen son güncelleme tarihi */
  updatedAt: string | null;
  /** Onay kayıtlarında saklanan metin sürümü */
  version: string;
  /** Markdown içerik */
  content: string;
}
`;

const body = entries
  .map(
    (e) => `
export const ${e.key}: LegalDocument = {
  slug: ${JSON.stringify(e.slug)},
  title: ${JSON.stringify(e.title)},
  description: ${JSON.stringify(e.description)},
  updatedAt: ${JSON.stringify(e.meta.updatedAt)},
  version: ${JSON.stringify(e.meta.version)},
  content: \`${escapeForTemplateLiteral(e.content)}\`,
};`
  )
  .join("\n");

const footer = `

/** Tüm yasal metinler — slug ile erişim için */
export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
${entries.map((e) => `  ${JSON.stringify(e.slug)}: ${e.key},`).join("\n")}
};

/** Onay kayıtlarında kullanılan güncel metin sürümleri */
export const LEGAL_VERSIONS = {
${entries.map((e) => `  ${e.key}: ${JSON.stringify(e.meta.version)},`).join("\n")}
} as const;
`;

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, header + body + footer, "utf8");

console.log(`src/content/legal.ts üretildi — ${entries.length} metin:`);
for (const e of entries) {
  const kb = (Buffer.byteLength(e.content, "utf8") / 1024).toFixed(1);
  console.log(
    `  /${e.slug}`.padEnd(34) + `v${e.meta.version}  ${e.meta.updatedAt ?? "tarihsiz"}  ${kb} KB`
  );
}
