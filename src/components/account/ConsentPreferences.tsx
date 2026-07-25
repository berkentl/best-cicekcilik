"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * İletişim ve reklam tercihleri.
 *
 * Onaylar bilinçli olarak profil formundan ayrı tutuluyor:
 *  - Rızalar profil verisinden bağımsız, ayrı ayrı verilebilir ve geri
 *    alınabilir olmalıdır (bkz. docs/legal/06-acik-riza-metni.md, EK).
 *  - Her değişiklik consent_logs'a ispat kaydı olarak yazılır; kayıt
 *    güncellenmez, yeni satır eklenir.
 *  - Geri alma, verme kadar kolaydır: tek tıkla kapatılır ve anında kaydedilir.
 */

type ConsentKey = "pazarlama_eposta" | "pazarlama_sms" | "profilleme";

interface ConsentState {
  pazarlama_eposta: boolean;
  pazarlama_sms: boolean;
  profilleme: boolean;
}

const SEED: ConsentState = {
  pazarlama_eposta: false,
  pazarlama_sms: false,
  profilleme: false,
};

export function ConsentPreferences() {
  const [state, setState] = useState<ConsentState>(SEED);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydedilen, setKaydedilen] = useState<ConsentKey | null>(null);
  const [hata, setHata] = useState("");

  useEffect(() => {
    fetch("/api/consent")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setState({
            pazarlama_eposta: Boolean(d.pazarlama_eposta),
            pazarlama_sms: Boolean(d.pazarlama_sms),
            profilleme: Boolean(d.profilleme),
          });
        }
      })
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, []);

  async function degistir(key: ConsentKey, granted: boolean) {
    setHata("");
    const oncekiDurum = state;
    setState((s) => ({ ...s, [key]: granted }));

    // Pazarlama onayı verildiğinde, iletinin gönderilebilmesi için gereken
    // yurt dışı aktarım rızası da (Resend üzerinden e-posta) birlikte yazılır.
    const consents: Array<{ type: string; granted: boolean }> = [
      { type: key, granted },
    ];
    if (key === "pazarlama_eposta") {
      consents.push({ type: "yurtdisi_aktarim", granted });
    }

    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "hesap_ayarlari", consents }),
      });
      if (!res.ok) throw new Error();
      setKaydedilen(key);
      setTimeout(() => setKaydedilen(null), 2200);
    } catch {
      setState(oncekiDurum);
      setHata("Tercih kaydedilemedi. Lütfen tekrar deneyin.");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#ede8e3] p-6 md:p-7">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a9c9c] mb-1.5">
        İletişim ve Reklam Tercihleri
      </p>
      <p className="text-[12.5px] leading-relaxed text-[#8a8580] mb-5">
        Bu tercihler alışveriş yapmanız için gerekli değildir. Kapatmanız hâlinde
        sipariş, teslimat ve fatura bildirimlerini almaya devam edersiniz.
      </p>

      {hata && (
        <p className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700">
          {hata}
        </p>
      )}

      <div className="space-y-1">
        <Tercih
          baslik="E-posta ile kampanya bildirimleri"
          aciklama={
            <>
              Kampanya, indirim ve özel gün duyuruları.{" "}
              <Link href="/ticari-elektronik-ileti" className="underline decoration-[#3d7b74]/40 underline-offset-2 text-[#3d7b74] hover:decoration-[#3d7b74]">
                Onay metni
              </Link>
            </>
          }
          checked={state.pazarlama_eposta}
          disabled={yukleniyor}
          kaydedildi={kaydedilen === "pazarlama_eposta"}
          onChange={(v) => degistir("pazarlama_eposta", v)}
        />

        <Tercih
          baslik="SMS ile kampanya bildirimleri"
          aciklama={
            <>
              Kampanya ve özel gün hatırlatmaları.{" "}
              <Link href="/ticari-elektronik-ileti" className="underline decoration-[#3d7b74]/40 underline-offset-2 text-[#3d7b74] hover:decoration-[#3d7b74]">
                Onay metni
              </Link>
            </>
          }
          checked={state.pazarlama_sms}
          disabled={yukleniyor}
          kaydedildi={kaydedilen === "pazarlama_sms"}
          onChange={(v) => degistir("pazarlama_sms", v)}
        />

        <Tercih
          baslik="İlgi alanıma uygun öneriler"
          aciklama={
            <>
              Alışveriş ve gezinme verilerimin, bana uygun ürün önerileri sunulması
              için analiz edilmesi (profilleme).{" "}
              <Link href="/acik-riza-metni" className="underline decoration-[#3d7b74]/40 underline-offset-2 text-[#3d7b74] hover:decoration-[#3d7b74]">
                Açık Rıza Metni
              </Link>
            </>
          }
          checked={state.profilleme}
          disabled={yukleniyor}
          kaydedildi={kaydedilen === "profilleme"}
          onChange={(v) => degistir("profilleme", v)}
          sonSatir
        />
      </div>

      <p className="mt-5 pt-4 border-t border-[#f0ebe6] text-[12px] leading-relaxed text-[#a8a29b]">
        Onaylarınızı{" "}
        <a
          href="https://iys.org.tr"
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-[#a8a29b]/40 underline-offset-2 hover:text-[#5c6564]"
        >
          İleti Yönetim Sistemi (İYS)
        </a>{" "}
        üzerinden de görüntüleyip değiştirebilirsiniz. Çerez tercihleriniz için
        sayfa altındaki &quot;Çerez Tercihleri&quot; bağlantısını kullanabilirsiniz.
      </p>
    </div>
  );
}

function Tercih({
  baslik,
  aciklama,
  checked,
  disabled,
  kaydedildi,
  onChange,
  sonSatir,
}: {
  baslik: string;
  aciklama: React.ReactNode;
  checked: boolean;
  disabled: boolean;
  kaydedildi: boolean;
  onChange: (v: boolean) => void;
  sonSatir?: boolean;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 py-3.5 cursor-pointer ${
        sonSatir ? "" : "border-b border-[#f5f1ed]"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13.5px] font-semibold text-[#1d3435]">{baslik}</p>
          {kaydedildi && (
            <span className="text-[10.5px] font-semibold uppercase tracking-wide text-[#3d7b74]">
              Kaydedildi
            </span>
          )}
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[#8a8580]">{aciklama}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#3d7b74]"
      />
    </label>
  );
}
