"use client";

import { useState } from "react";
import type { IbanEntry } from "@/types";

/**
 * Havale/EFT hesap bilgileri.
 *
 * Ödeme adımında ve sipariş onay sayfasında kullanılır. İki bağlamın farkı
 * sipariş numarasının varlığı: ödeme adımında sipariş henüz oluşmadığı için
 * numara YOKTUR, onay sayfasında vardır. Numara varsa açıklama alanı
 * kopyalanabilir biçimde gösterilir — havalede en sık yapılan hata,
 * açıklamaya sipariş numarasının yazılmaması.
 *
 * Tasarım kararı: IBAN'ı elle okuyup yazmak hata kaynağıdır, bu yüzden
 * asıl eylem kopyalamaktır ve düğme birincil konumda durur.
 */

function KopyalaDugmesi({
  deger,
  etiket,
  boyut = "normal",
}: {
  deger: string;
  etiket: string;
  boyut?: "normal" | "kucuk";
}) {
  const [kopyalandi, setKopyalandi] = useState(false);

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(deger);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      // Pano erişimi reddedilirse sessiz kal — metin zaten seçilebilir
    }
  }

  const kucuk = boyut === "kucuk";

  return (
    <button
      type="button"
      onClick={kopyala}
      aria-label={`${etiket} kopyala`}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border font-semibold transition-colors ${
        kucuk ? "min-h-[36px] px-3 text-[11.5px]" : "min-h-[44px] px-4 text-[12.5px]"
      } ${
        kopyalandi
          ? "border-[#3d7b74] bg-[#3d7b74] text-white"
          : "border-[#3d7b74]/30 bg-white text-[#3d7b74] hover:border-[#3d7b74]/60 active:bg-[#3d7b74]/5"
      }`}
    >
      {kopyalandi ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Kopyalandı
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-2m-6-9h6a2 2 0 012 2v6m-8-8V5a2 2 0 012-2h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V13a2 2 0 01-2 2h-2"
            />
          </svg>
          Kopyala
        </>
      )}
    </button>
  );
}

/** IBAN'ı 4'erli gruplar hâlinde okunur biçime getirir. */
function ibanBicimle(iban: string): string {
  return iban.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
}

export function BankTransferDetails({
  ibans,
  orderNumber,
  total,
}: {
  ibans: IbanEntry[];
  /** Sipariş numarası — yalnızca sipariş oluşturulduktan sonra bilinir. */
  orderNumber?: string;
  /** Gönderilecek tutar — onay sayfasında gösterilir. */
  total?: number;
}) {
  if (ibans.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Sipariş numarası uyarısı — havalede en kritik adım.
          Numara henüz yoksa beklenti doğru kurulur, varsa kopyalanabilir. */}
      {orderNumber ? (
        <div className="rounded-xl bg-[#fdf6e8] p-4">
          <p className="text-[12.5px] font-semibold text-[#8a6d1f]">
            Açıklama alanına mutlaka sipariş numaranızı yazın
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#96814a]">
            Ödemenizi siparişinizle eşleştirebilmemizin tek yolu bu. Numara yazılmayan
            ödemeler tespit edilemeyebilir ve siparişiniz hazırlanmaya başlanmaz.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2.5">
            <span className="font-mono text-[14px] font-semibold tracking-wide text-[#1d3435]">
              {orderNumber}
            </span>
            <span className="ml-auto">
              <KopyalaDugmesi deger={orderNumber} etiket="Sipariş numarası" boyut="kucuk" />
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[#fdf6e8] px-4 py-3">
          <p className="text-[12px] leading-relaxed text-[#8a6d1f]">
            <span className="font-semibold">Sipariş numaranızı</span> siparişi
            tamamladığınızda göreceksiniz. Havale açıklamasına{" "}
            <span className="font-semibold">mutlaka o numarayı</span> yazmanız gerekiyor —
            ödemeyi siparişinizle ancak böyle eşleştirebiliyoruz.
          </p>
        </div>
      )}

      {/* Hesap kartları */}
      {ibans.map((entry) => (
        <div
          key={entry.id}
          className="rounded-xl border border-[#e3ded7] bg-white p-4"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13.5px] font-semibold text-[#1d3435]">{entry.bank}</p>
            <p className="text-[11.5px] text-[#a09890]">Alıcı</p>
          </div>
          <p className="mt-0.5 text-[12.5px] text-[#5c6564]">{entry.holder}</p>

          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <p className="min-w-0 flex-1 select-all break-all font-mono text-[14.5px] font-medium leading-snug tracking-[0.02em] text-[#1d3435] sm:text-[15px]">
              {ibanBicimle(entry.iban)}
            </p>
            <KopyalaDugmesi deger={entry.iban.replace(/\s/g, "")} etiket="IBAN" />
          </div>
        </div>
      ))}

      {total !== undefined && (
        <div className="flex items-center justify-between rounded-xl bg-[#f4f2ee] px-4 py-3">
          <span className="text-[12.5px] text-[#5c6564]">Gönderilecek tutar</span>
          <span className="font-semibold text-[15px] text-[#1d3435] tabular-nums">
            ₺{total.toLocaleString("tr-TR")}
          </span>
        </div>
      )}

      <p className="text-[11.5px] leading-relaxed text-[#a09890]">
        Ödemeniz hesabımıza geçtiğinde siparişiniz hazırlanmaya başlanır ve durumu
        size bildirilir. Havale/EFT&apos;nin bankanıza göre birkaç saat sürebileceğini
        hatırlatmak isteriz.
      </p>
    </div>
  );
}
