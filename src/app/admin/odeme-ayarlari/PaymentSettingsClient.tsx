"use client";

import { useState, useTransition } from "react";
import type { PaymentSettings, IbanEntry } from "@/types";
import {
  updateKapidaSettings,
  updateHavaleEnabled,
  addIban,
  deleteIban,
} from "./actions";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none " +
        (checked ? "bg-[#1d3435]" : "bg-[#d4cdc7]")
      }
    >
      <span
        className={
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform " +
          (checked ? "translate-x-6" : "translate-x-1")
        }
      />
    </button>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
        active
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-[#f5f2ef] text-[#a09890] border border-[#e8e2dc]"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-[#c0b8b0]"}`} />
      {active ? "Aktif" : "Pasif"}
    </span>
  );
}

const inputCls =
  "w-full border border-[#e8e2dc] rounded-lg px-3 py-2.5 text-[13px] text-[#1d3435] placeholder:text-[#c0b8b0] focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/15 transition-all";

const labelCls =
  "block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a7070] mb-1.5";

const emptyIban: Omit<IbanEntry, "id"> = { bank: "", holder: "", iban: "" };

export function PaymentSettingsClient({ initial }: { initial: PaymentSettings }) {
  const [settings, setSettings] = useState<PaymentSettings>(initial);
  const [isPending, startTransition] = useTransition();

  // Kapıda Ödeme local state
  const [kapidaFeeInput, setKapidaFeeInput] = useState(String(initial.kapida_fee));
  const [kapidaSaved, setKapidaSaved] = useState(false);

  // Yeni IBAN formu
  const [newIban, setNewIban] = useState<Omit<IbanEntry, "id">>(emptyIban);
  const [ibanFormOpen, setIbanFormOpen] = useState(false);
  const [ibanError, setIbanError] = useState("");

  const handleKapidaToggle = (enabled: boolean) => {
    setSettings((s) => ({ ...s, kapida_enabled: enabled }));
    startTransition(async () => {
      await updateKapidaSettings(enabled, Number(kapidaFeeInput) || 0);
    });
  };

  const handleKapidaFeeSave = () => {
    const fee = Number(kapidaFeeInput) || 0;
    setSettings((s) => ({ ...s, kapida_fee: fee }));
    startTransition(async () => {
      await updateKapidaSettings(settings.kapida_enabled, fee);
      setKapidaSaved(true);
      setTimeout(() => setKapidaSaved(false), 2000);
    });
  };

  const handleHavaleToggle = (enabled: boolean) => {
    setSettings((s) => ({ ...s, havale_enabled: enabled }));
    startTransition(async () => {
      await updateHavaleEnabled(enabled);
    });
  };

  const handleAddIban = () => {
    setIbanError("");
    if (!newIban.bank.trim() || !newIban.holder.trim() || !newIban.iban.trim()) {
      setIbanError("Tüm alanlar zorunludur.");
      return;
    }
    const ibanClean = newIban.iban.replace(/\s/g, "").toUpperCase();
    if (!/^TR\d{24}$/.test(ibanClean)) {
      setIbanError("Geçerli bir TR IBAN girin (TR + 24 rakam).");
      return;
    }
    const entry: Omit<IbanEntry, "id"> = {
      bank: newIban.bank.trim(),
      holder: newIban.holder.trim(),
      iban: ibanClean,
    };
    startTransition(async () => {
      await addIban(entry);
      setSettings((s) => ({
        ...s,
        havale_ibans: [...s.havale_ibans, { ...entry, id: "temp-" + Date.now() }],
      }));
      setNewIban(emptyIban);
      setIbanFormOpen(false);
    });
  };

  const handleDeleteIban = (id: string) => {
    setSettings((s) => ({ ...s, havale_ibans: s.havale_ibans.filter((e) => e.id !== id) }));
    startTransition(async () => {
      await deleteIban(id);
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-xl font-medium text-[#1d3435]">Ödeme Yöntemleri</h1>
        <p className="text-[13px] text-[#999] mt-1">
          Aktif ödeme yöntemlerini ve koşullarını yönetin. Değişiklikler anında sepet sayfasına yansır.
        </p>
      </div>

      {/* Kapıda Ödeme */}
      <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f0ec] bg-[#faf8f6]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1d3435]/8 text-[#3d7b74]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[#1d3435]">Kapıda Ödeme</p>
              <p className="text-[11px] text-[#a09890]">Nakit veya Kredi Kartı ile teslimatta ödeme</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill active={settings.kapida_enabled} />
            <Toggle checked={settings.kapida_enabled} onChange={handleKapidaToggle} />
          </div>
        </div>

        {settings.kapida_enabled && (
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className={labelCls}>Ek Hizmet Bedeli (TL)</label>
              <p className="text-[11px] text-[#a09890] mb-2">
                0 girilirse ek ücret alınmaz. Girilen tutar sipariş toplamına eklenir.
              </p>
              <div className="flex gap-3">
                <div className="relative flex-1 max-w-[200px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[#a09890]">₺</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={kapidaFeeInput}
                    onChange={(e) => setKapidaFeeInput(e.target.value)}
                    className={inputCls + " pl-7"}
                    placeholder="0"
                  />
                </div>
                <button
                  onClick={handleKapidaFeeSave}
                  disabled={isPending}
                  className="px-4 py-2.5 bg-[#1d3435] text-white text-[13px] font-semibold rounded-lg hover:bg-[#243f40] transition-colors disabled:opacity-60"
                >
                  {kapidaSaved ? "Kaydedildi ✓" : "Kaydet"}
                </button>
              </div>
            </div>

            {Number(kapidaFeeInput) > 0 && (
              <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[12px] text-amber-800 leading-relaxed">
                  Müşteriler kapıda ödeme seçtiğinde toplam tutara <strong>₺{Number(kapidaFeeInput).toLocaleString("tr-TR")}</strong> ek hizmet bedeli eklenecektir.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Banka Havalesi / EFT */}
      <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f4f0ec] bg-[#faf8f6]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1d3435]/8 text-[#3d7b74]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[#1d3435]">Banka Havalesi / EFT</p>
              <p className="text-[11px] text-[#a09890]">Müşteri sipariş öncesinde havale yapar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill active={settings.havale_enabled} />
            <Toggle checked={settings.havale_enabled} onChange={handleHavaleToggle} />
          </div>
        </div>

        {settings.havale_enabled && (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#1d3435]">Hesap Listesi</p>
                <p className="text-[11px] text-[#a09890] mt-0.5">
                  Ödeme sayfasında müşteriye gösterilecek banka hesapları
                </p>
              </div>
              <button
                onClick={() => { setIbanFormOpen(true); setIbanError(""); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1d3435] text-white text-[12px] font-semibold rounded-lg hover:bg-[#243f40] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Yeni IBAN Ekle
              </button>
            </div>

            {/* IBAN listesi */}
            {settings.havale_ibans.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-[#e8e2dc] rounded-xl">
                <svg className="w-8 h-8 text-[#c0b8b0] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4" />
                </svg>
                <p className="text-[13px] text-[#a09890]">Henüz hesap eklenmedi.</p>
                <p className="text-[11px] text-[#c0b8b0] mt-1">
                  &quot;Yeni IBAN Ekle&quot; butonuna tıklayarak başlayın.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {settings.havale_ibans.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 p-4 bg-[#faf8f6] rounded-xl border border-[#ede8e3]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1d3435]">{entry.bank}</p>
                      <p className="text-[12px] text-[#6e6560] mt-0.5">{entry.holder}</p>
                      <p className="text-[12px] font-mono text-[#3d7b74] mt-1 tracking-wider">
                        {entry.iban.replace(/(.{4})/g, "$1 ").trim()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteIban(entry.id)}
                      disabled={isPending}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#cc5555] hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      title="Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Yeni IBAN formu */}
            {ibanFormOpen && (
              <div className="p-5 bg-[#f0f8f7] border border-[#c8e6e1] rounded-xl space-y-4">
                <p className="text-[13px] font-semibold text-[#1d3435]">Yeni Hesap Ekle</p>
                {ibanError && (
                  <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {ibanError}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Banka Adı *</label>
                    <input
                      type="text"
                      placeholder="ör. Ziraat Bankası"
                      value={newIban.bank}
                      onChange={(e) => setNewIban((p) => ({ ...p, bank: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Hesap Sahibi *</label>
                    <input
                      type="text"
                      placeholder="ör. Best Çiçekçilik"
                      value={newIban.holder}
                      onChange={(e) => setNewIban((p) => ({ ...p, holder: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>IBAN *</label>
                  <input
                    type="text"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    value={newIban.iban}
                    onChange={(e) => setNewIban((p) => ({ ...p, iban: e.target.value }))}
                    className={inputCls + " font-mono tracking-wider"}
                    maxLength={32}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddIban}
                    disabled={isPending}
                    className="flex-1 py-2.5 bg-[#1d3435] text-white text-[13px] font-semibold rounded-lg hover:bg-[#243f40] transition-colors disabled:opacity-60"
                  >
                    {isPending ? "Ekleniyor..." : "Ekle"}
                  </button>
                  <button
                    onClick={() => { setIbanFormOpen(false); setNewIban(emptyIban); setIbanError(""); }}
                    className="px-5 py-2.5 border border-[#e8e2dc] text-[#6e6560] text-[13px] font-semibold rounded-lg hover:bg-[#f5f2ef] transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Online Kart — bilgi */}
      <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden opacity-60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#f0ede9] text-[#c0b8b0]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2 10h20" />
              </svg>
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[#1d3435]">Online Kredi / Banka Kartı</p>
              <p className="text-[11px] text-[#a09890]">Yakında — Sanal POS entegrasyonu</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-[#f5f2ef] text-[#a09890] border border-[#e8e2dc] px-3 py-1 rounded-full">
            Yakında
          </span>
        </div>
      </div>

      {isPending && (
        <p className="text-[12px] text-[#3d7b74] text-right flex items-center gap-1.5 justify-end">
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Kaydediliyor...
        </p>
      )}
    </div>
  );
}
