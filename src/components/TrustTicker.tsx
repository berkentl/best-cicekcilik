"use client";

/**
 * Şeritteki her ibare, yayımlanmış yasal metinlerde karşılığı bulunan ve
 * işletmenin fiilen sunduğu bir hizmete karşılık gelir. Buraya sunulmayan
 * bir hizmet yazılması hem 6502 sayılı Kanun m.61 bakımından yanıltıcı
 * ticari reklam oluşturur hem de sözleşme metinleriyle çelişki doğurur.
 *
 * Kaldırılan ibareler ve gerekçeleri:
 * - "iyzico Güvenceli Alışveriş": ödeme altyapısı iyzico değil; başka bir
 *   ödeme kuruluşunun güvencesine atıf yapmak gerçeğe aykırıydı.
 * - "Kredi Kartına Taksit İmkânı": taksit kapatıldı (no_installment).
 * - "Ücretsiz İade & Değişim": İptal ve İade Koşulları m.2 uyarınca çabuk
 *   bozulabilen mallarda cayma hakkı bulunmuyor; koşulsuz ücretsiz iade
 *   taahhüdü sözleşmeye aykırıydı.
 * - "7/24 Müşteri Desteği": destek saatleri 08:00–21:00.
 * - "Aynı Gün Kapıda Teslimat": "kapıda" ibaresi kapıda ödeme çağrışımı
 *   yapıyordu, böyle bir hizmet yok.
 */
const items = [
  {
    // 256-Bit SSL: site tüm sayfalarında TLS üzerinden sunuluyor.
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    text: "256-Bit SSL Güvenli Ödeme",
  },
  {
    // Teslimat Bilgileri m.3 ile aynı saat.
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: "Saat 12:00'a Kadar Aynı Gün Teslimat",
  },
  {
    // Teslimat Bilgileri m.5 — görsel onay süreci.
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 9a2 2 0 012-2h1.5l1.2-1.8A1 1 0 019.5 5h5a1 1 0 01.8.4L16.5 7H19a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    text: "Teslimat Öncesi Görsel Onay",
  },
  {
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    text: "Taze Çiçek Garantisi",
  },
  {
    // Teslimat Bilgileri m.8 — ayıplı üründe seçimlik haklar.
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.3 5.3L4 7.5M4 15a8 8 0 0013.7 3.7L20 16.5" />
      </svg>
    ),
    text: "Hasarlı Üründe İade veya Yenileme",
  },
  {
    // Teslimat Bilgileri m.1 — yalnızca İstanbul ve aktif listelenen ilçeler.
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    text: "İstanbul İçi Teslimat",
  },
  {
    // İletişim sayfasındaki çalışma saatleri: Pazar dâhil her gün açık.
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12a8.94 8.94 0 01-1.05 4.2L21 21l-4.8-1.05A8.94 8.94 0 0112 21a9 9 0 119-9z" />
      </svg>
    ),
    text: "Haftanın 7 Günü Müşteri Desteği",
  },
  {
    // Kişiye özel üretim ve Teslimat Bilgileri m.6 — kart mesajı.
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l7.586-7.586z" />
      </svg>
    ),
    text: "Kişiye Özel Tasarım ve Kart Mesajı",
  },
];

const SEPARATOR = (
  <span className="mx-6 text-[#c8b8a2] text-lg select-none" aria-hidden>✦</span>
);

export function TrustTicker() {
  const repeated = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden bg-[#1d3435] border-y border-[#2a4a4b] py-3.5 select-none">
      {/* Sol fade */}
      <div className="absolute left-0 top-0 h-full w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #1d3435, transparent)" }} />
      {/* Sağ fade */}
      <div className="absolute right-0 top-0 h-full w-16 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #1d3435, transparent)" }} />

      <div className="flex w-max animate-ticker">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center gap-2.5 whitespace-nowrap">
            <span className="text-[#c8b8a2]">{item.icon}</span>
            <span className="text-[13px] font-semibold text-white/90 tracking-wide uppercase font-sans">
              {item.text}
            </span>
            {SEPARATOR}
          </span>
        ))}
      </div>
    </div>
  );
}
