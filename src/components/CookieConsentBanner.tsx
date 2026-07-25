"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

/**
 * Çerez onay bandı.
 *
 * Açık Rıza Metni'nin ek bölümündeki zorunlu kurallara uyar:
 *  - Zorunlu olmayan çerezler onay alınmadan çalıştırılmaz
 *  - "Yalnızca Zorunlu" seçeneği "Tümünü Kabul Et" ile aynı görsel ağırlıkta
 *  - Analitik ve pazarlama onayları ayrı ayrı verilebilir
 *  - Geri alma, verme kadar kolay (footer'daki "Çerez Tercihleri" bağlantısı)
 *
 * Tercih localStorage'da tutulur; ayrıca consent_logs'a ispat kaydı yazılır.
 */

const STORAGE_KEY = "dunyanin-cicegi-cerez-onayi";

interface CookiePreferences {
  analitik: boolean;
  pazarlama: boolean;
  /** Onaylanan çerez politikası sürümü — metin güncellenirse tekrar sorulur */
  surum: string;
}

/** Gizlilik ve Çerez Politikası'nın güncel sürümü. */
const CURRENT_VERSION = "1.0";

export function readCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookiePreferences;
    // Politika sürümü değiştiyse onay yeniden alınır
    if (parsed.surum !== CURRENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * localStorage'daki tercih durumunu React'a bağlar.
 *
 * useSyncExternalStore kullanılıyor çünkü localStorage React dışı bir
 * kaynaktır; effect içinde setState çağırmak gereksiz ek render doğurur.
 * Sunucu tarafında "tercih var" varsayılır — böylece band SSR çıktısında
 * yer almaz ve hidrasyon uyuşmazlığı oluşmaz.
 */
const tercihStore = {
  subscribe(onChange: () => void) {
    window.addEventListener("cerez-tercihi-degisti", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("cerez-tercihi-degisti", onChange);
      window.removeEventListener("storage", onChange);
    };
  },
  getSnapshot() {
    return readCookiePreferences() !== null;
  },
  getServerSnapshot() {
    return true;
  },
};

export function CookieConsentBanner() {
  const tercihVar = useSyncExternalStore(
    tercihStore.subscribe,
    tercihStore.getSnapshot,
    tercihStore.getServerSnapshot
  );

  /** Footer'daki "Çerez Tercihleri" bağlantısıyla elle açıldı mı? */
  const [elleAcildi, setElleAcildi] = useState(false);
  const [detayAcik, setDetayAcik] = useState(false);
  const [analitik, setAnalitik] = useState(false);
  const [pazarlama, setPazarlama] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  // Olay dinleyicisi kaydı; setState yalnızca olay tetiklendiğinde
  // (effect gövdesinde değil) çağrıldığı için ek render doğurmaz.
  useEffect(() => {
    const yenidenAc = () => {
      const mevcut = readCookiePreferences();
      setAnalitik(mevcut?.analitik ?? false);
      setPazarlama(mevcut?.pazarlama ?? false);
      setDetayAcik(true);
      setElleAcildi(true);
    };
    window.addEventListener("cerez-tercihleri-ac", yenidenAc);
    return () => window.removeEventListener("cerez-tercihleri-ac", yenidenAc);
  }, []);

  const kaydet = useCallback(
    async (tercihler: { analitik: boolean; pazarlama: boolean }) => {
      setKaydediliyor(true);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...tercihler, surum: CURRENT_VERSION })
      );
      // Store'u haberdar et — band kendiliğinden kapanır
      window.dispatchEvent(new Event("cerez-tercihi-degisti"));

      // İspat kaydı — başarısız olsa bile bandı kapatıyoruz, kullanıcıyı bekletmiyoruz
      fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "cerez_bandi",
          consents: [
            { type: "cerez_analitik", granted: tercihler.analitik },
            { type: "cerez_pazarlama", granted: tercihler.pazarlama },
          ],
        }),
      }).catch(() => {});

      setElleAcildi(false);
      setDetayAcik(false);
      setKaydediliyor(false);
    },
    []
  );

  // Tercih hiç belirtilmediyse veya kullanıcı footer'dan elle açtıysa göster
  if (tercihVar && !elleAcildi) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Çerez tercihleri"
      className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-[820px] rounded-2xl border border-[#e6e1da] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.14)] sm:p-6">
        {/* globals.css'te h1-h3 global olarak serif; burada gövde fontu isteniyor */}
        <h2 className="font-sans text-[15px] font-semibold text-[#1d3435]">
          Çerez Tercihleri
        </h2>

        <p className="mt-2 text-[13.5px] leading-relaxed text-[#5c6564]">
          Zorunlu çerezler sitenin çalışması için gereklidir ve onay alınmaksızın
          kullanılır. Analitik ve pazarlama çerezleri yalnızca onayınızla çalışır.{" "}
          <Link
            href="/gizlilik"
            className="text-[#3d7b74] underline decoration-[#3d7b74]/30 underline-offset-2 hover:decoration-[#3d7b74]"
          >
            Gizlilik ve Çerez Politikası
          </Link>
        </p>

        {detayAcik && (
          <div className="mt-4 space-y-2.5 rounded-xl bg-[#faf8f5] p-4">
            <div className="flex items-start justify-between gap-4 pb-2.5 border-b border-[#e6e1da]">
              <div>
                <p className="text-[13.5px] font-semibold text-[#1d3435]">
                  Zorunlu Çerezler
                </p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#8a8580]">
                  Oturum yönetimi ve sepet işlemleri. Devre dışı bırakılamaz.
                </p>
              </div>
              <span className="mt-0.5 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#3d7b74]">
                Her zaman aktif
              </span>
            </div>

            <Secim
              baslik="Analitik Çerezler"
              aciklama="Site kullanımının ölçümlenmesi (Google Analytics)."
              checked={analitik}
              onChange={setAnalitik}
            />
            <Secim
              baslik="Pazarlama Çerezleri"
              aciklama="İlgi alanınıza uygun reklam gösterimi (Meta Pixel, Google Ads). Verileriniz yurt dışına aktarılır."
              checked={pazarlama}
              onChange={setPazarlama}
            />
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {detayAcik ? (
            <button
              onClick={() => kaydet({ analitik, pazarlama })}
              disabled={kaydediliyor}
              className="order-1 rounded-lg bg-[#1d3435] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2a4647] disabled:opacity-50 sm:order-2"
            >
              Tercihlerimi Kaydet
            </button>
          ) : (
            <button
              onClick={() => kaydet({ analitik: true, pazarlama: true })}
              disabled={kaydediliyor}
              className="order-1 rounded-lg bg-[#1d3435] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2a4647] disabled:opacity-50 sm:order-2"
            >
              Tümünü Kabul Et
            </button>
          )}

          {/* Reddetme seçeneği, kabul ile aynı görsel ağırlıkta sunulmalıdır —
              silik veya zor bulunur tasarım rızayı geçersiz kılar. */}
          <button
            onClick={() => kaydet({ analitik: false, pazarlama: false })}
            disabled={kaydediliyor}
            className="order-2 rounded-lg border border-[#1d3435]/25 bg-white px-5 py-2.5 text-[13px] font-semibold text-[#1d3435] transition-colors hover:border-[#1d3435]/50 disabled:opacity-50 sm:order-1"
          >
            Yalnızca Zorunlu Çerezler
          </button>

          {!detayAcik && (
            <button
              onClick={() => setDetayAcik(true)}
              className="order-3 px-1 py-2.5 text-[13px] font-medium text-[#5c6564] underline decoration-[#5c6564]/30 underline-offset-2 transition-colors hover:text-[#1d3435] sm:order-3 sm:ml-auto"
            >
              Tercihleri Yönet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Secim({
  baslik,
  aciklama,
  checked,
  onChange,
}: {
  baslik: string;
  aciklama: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-1">
      <div>
        <p className="text-[13.5px] font-semibold text-[#1d3435]">{baslik}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#8a8580]">{aciklama}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#3d7b74]"
      />
    </label>
  );
}
