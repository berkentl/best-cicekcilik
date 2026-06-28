"use client";
import { useState, useEffect } from "react";
import type { Announcement } from "@/types";

const inputCls = "w-full border border-[#e8e8e8] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/10 transition-all";
const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-[#1d3435] mb-1.5";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={"relative inline-flex h-6 w-11 items-center rounded-full transition-colors " + (checked ? "bg-[#1d3435]" : "bg-[#ddd]")}>
      <span className={"inline-block h-4 w-4 rounded-full bg-white shadow transition-transform " + (checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

function newAnn(): Announcement {
  return { id: crypto.randomUUID(), text: "", durationSec: 5 };
}

export default function AdminAyarlarPage() {
  const [siteName, setSiteName] = useState("Best Cicekcilik & Organizasyon");
  const [phone, setPhone] = useState("0532 295 93 09");
  const [email, setEmail] = useState("info@bestcicekcilik.com");
  const [address, setAddress] = useState("Fulya, 19 Mayis, Aytekin Kotil Cd. No:18, 34360 Sisli/Istanbul");
  const [announcements, setAnnouncements] = useState<Announcement[]>([newAnn()]);
  const [annActive, setAnnActive] = useState(true);
  const [freeThreshold, setFreeThreshold] = useState("3000");
  const [baseShipping, setBaseShipping] = useState("200");
  const [shippingInfo, setShippingInfo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [preview, setPreview] = useState(0);

  useEffect(() => {
    fetch("/api/site-settings").then(r => r.json()).then((data: Record<string, string>) => {
      if (data.announcements) {
        try {
          const parsed = JSON.parse(data.announcements) as Announcement[];
          if (Array.isArray(parsed) && parsed.length > 0) setAnnouncements(parsed);
        } catch {}
      } else if (data.announcement_text) {
        setAnnouncements([{ id: "legacy", text: data.announcement_text, durationSec: 5 }]);
      }
      if (data.announcement_active !== undefined) setAnnActive(data.announcement_active === "true");
      if (data.free_shipping_threshold) setFreeThreshold(data.free_shipping_threshold);
      if (data.base_shipping_fee) setBaseShipping(data.base_shipping_fee);
      if (data.shipping_info) setShippingInfo(data.shipping_info);
    }).catch(() => {});
  }, []);

  /* Preview carousel */
  useEffect(() => {
    if (announcements.length <= 1) return;
    const t = setTimeout(() => setPreview(i => (i + 1) % announcements.length), (announcements[preview]?.durationSec ?? 5) * 1000);
    return () => clearTimeout(t);
  }, [preview, announcements]);

  const updateAnn = (id: string, field: keyof Announcement, value: string | number) =>
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));

  const removeAnn = (id: string) =>
    setAnnouncements(prev => prev.length > 1 ? prev.filter(a => a.id !== id) : prev);

  const moveAnn = (id: string, dir: -1 | 1) =>
    setAnnouncements(prev => {
      const idx = prev.findIndex(a => a.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });

  const handleSave = async () => {
    setSaving(true); setSaveError("");
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcements: JSON.stringify(announcements),
          announcement_active: String(annActive),
          free_shipping_threshold: freeThreshold,
          base_shipping_fee: baseShipping,
          shipping_info: shippingInfo,
        }),
      });
      if (!res.ok) throw new Error("Kayit hatasi");
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (err) { setSaveError(err instanceof Error ? err.message : String(err)); }
    finally { setSaving(false); }
  };

  const currentPreviewText = announcements[preview % announcements.length]?.text;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-[#1d3435]">Site Ayarlari</h1>
        <p className="text-[13px] text-[#999]">Genel site bilgilerini duzenleyin</p>
      </div>
      {saved && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-[13px] text-green-700 font-semibold">Ayarlar basariyla kaydedildi.</div>}
      {saveError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[13px] text-red-700">{saveError}</div>}

      {/* Genel Bilgiler */}
      <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm p-6 space-y-5">
        <h2 className="text-[14px] font-bold text-[#1d3435] border-b border-[#f5f5f5] pb-3">Genel Bilgiler</h2>
        {[{ label: "Isletme Adi", value: siteName, onChange: setSiteName }, { label: "Telefon", value: phone, onChange: setPhone }, { label: "E-posta", value: email, onChange: setEmail }].map(f => (
          <div key={f.label}><label className={labelCls}>{f.label}</label><input type="text" value={f.value} onChange={e => f.onChange(e.target.value)} className={inputCls} /></div>
        ))}
        <div><label className={labelCls}>Adres</label><textarea rows={3} value={address} onChange={e => setAddress(e.target.value)} className={inputCls + " resize-none"} /></div>
      </div>

      {/* Duyuru Seritleri */}
      <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm p-6 space-y-5">
        <div className="border-b border-[#f5f5f5] pb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[14px] font-bold text-[#1d3435]">Duyuru Seritleri (Top Bar)</h2>
            <p className="text-[12px] text-[#999] mt-1">Her duyuru, belirlenen sure kadar gosterilder ve sirali sekilde dongusel degisir.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[12px] text-[#999]">{annActive ? "Aktif" : "Pasif"}</span>
            <Toggle checked={annActive} onChange={setAnnActive} />
          </div>
        </div>

        {/* Duyuru listesi */}
        <div className="space-y-3">
          {announcements.map((ann, i) => (
            <div key={ann.id} className="flex gap-2 items-start p-3 bg-[#fafafa] rounded-xl border border-[#efefef]">
              <div className="flex flex-col gap-1 flex-shrink-0 pt-1">
                <button onClick={() => moveAnn(ann.id, -1)} disabled={i === 0}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#999] hover:text-[#1d3435] disabled:opacity-25 text-[10px] border border-[#e8e8e8] bg-white">
                  ▲
                </button>
                <button onClick={() => moveAnn(ann.id, 1)} disabled={i === announcements.length - 1}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#999] hover:text-[#1d3435] disabled:opacity-25 text-[10px] border border-[#e8e8e8] bg-white">
                  ▼
                </button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] font-bold text-[#aaa] uppercase tracking-wider">Duyuru {i + 1}</span>
                </div>
                <input
                  type="text"
                  value={ann.text}
                  onChange={e => updateAnn(ann.id, "text", e.target.value)}
                  placeholder="Duyuru metnini girin..."
                  className={inputCls}
                />
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-[#999] whitespace-nowrap">Sure (saniye):</label>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={ann.durationSec}
                    onChange={e => updateAnn(ann.id, "durationSec", Number(e.target.value))}
                    className="w-20 border border-[#e8e8e8] rounded-md px-2 py-1.5 text-[13px] focus:outline-none focus:border-[#3d7b74] transition-all"
                  />
                  <span className="text-[11px] text-[#bbb]">saniye gosterilir</span>
                </div>
              </div>
              <button
                onClick={() => removeAnn(ann.id)}
                disabled={announcements.length <= 1}
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[#cc5555] hover:bg-[#fff0f0] disabled:opacity-25 transition-colors mt-1"
                title="Sil"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setAnnouncements(prev => [...prev, newAnn()])}
          className="w-full py-2.5 border-2 border-dashed border-[#ddd] rounded-xl text-[13px] text-[#999] hover:border-[#3d7b74] hover:text-[#3d7b74] transition-colors font-medium"
        >
          + Yeni Duyuru Ekle
        </button>

        {annActive && announcements.some(a => a.text) && (
          <div className="rounded-lg bg-[#1d3435] text-white text-[12px] text-center py-2.5 px-4 font-medium relative overflow-hidden">
            <span className="text-[10px] text-white/50 absolute left-3 top-1/2 -translate-y-1/2">
              {announcements.filter(a => a.text).length > 1 ? `${(preview % announcements.filter(a=>a.text).length) + 1}/${announcements.filter(a=>a.text).length}` : ""}
            </span>
            Onizleme: {currentPreviewText}
          </div>
        )}
      </div>

      {/* Kargo Ayarlari */}
      <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm p-6 space-y-5">
        <div className="border-b border-[#f5f5f5] pb-3">
          <h2 className="text-[14px] font-bold text-[#1d3435]">Kargo Ayarlari</h2>
          <p className="text-[12px] text-[#999] mt-1">Standart kargo ucreti ve ucretsiz kargo alt limiti.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Standart Kargo (TL)</label>
            <input type="number" min="0" step="10" value={baseShipping} onChange={e => setBaseShipping(e.target.value)} className={inputCls} />
            <p className="text-[11px] text-[#999] mt-1">Tum ilceler icin baz ucret.</p>
          </div>
          <div>
            <label className={labelCls}>Ucretsiz Kargo Limiti (TL)</label>
            <input type="number" min="0" step="100" value={freeThreshold} onChange={e => setFreeThreshold(e.target.value)} className={inputCls} />
            <p className="text-[11px] text-[#999] mt-1">0 = limit yok.</p>
          </div>
        </div>
        {Number(freeThreshold) > 0 && (
          <div className="rounded-lg bg-[#f0faf5] border border-[#c6e8d5] px-4 py-3 text-[12px] text-[#1d6e3e]">
            Musteriler {Number(freeThreshold).toLocaleString("tr-TR")} TL uzeri siparislerde ucretsiz kargo kazanir.
          </div>
        )}
      </div>

      {/* Urun sayfasi gonderi metni */}
      <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm p-6 space-y-4">
        <div className="border-b border-[#f5f5f5] pb-3">
          <h2 className="text-[14px] font-bold text-[#1d3435]">Urun Sayfasi Gonderi Metni</h2>
          <p className="text-[12px] text-[#999] mt-1">Urun detay sayfasindaki Gonderi Bilgileri bolumu. Her satir ayri madde. Bos = otomatik metin.</p>
        </div>
        <textarea rows={5} value={shippingInfo} onChange={e => setShippingInfo(e.target.value)}
          placeholder="Saat 14:00a kadar verilen siparisler ayni gun teslim edilir."
          className={inputCls + " resize-none leading-relaxed"} />
      </div>

      {/* Sifre */}
      <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm p-6 space-y-4">
        <h2 className="text-[14px] font-bold text-[#1d3435] border-b border-[#f5f5f5] pb-3">Yonetici Sifresi</h2>
        {["Mevcut Sifre", "Yeni Sifre", "Yeni Sifre (Tekrar)"].map(l => (
          <div key={l}><label className={labelCls}>{l}</label><input type="password" placeholder="..." className={inputCls} /></div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-[#1d3435] text-white rounded-md text-[13px] font-bold hover:bg-[#2a4a4b] transition-colors disabled:opacity-60">
          {saving ? "Kaydediliyor..." : "Degisiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}
