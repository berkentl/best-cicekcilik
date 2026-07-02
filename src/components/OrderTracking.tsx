"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Aşama tanımları ──────────────────────────────────────────────
const STEPS = [
  {
    key: "received",
    label: "Sipariş Alındı",
    desc: "Siparişiniz sistemimize kaydedildi.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
        <path d="M16 3H8a2 2 0 00-2 4h12a2 2 0 00-2-4z" />
      </svg>
    ),
  },
  {
    key: "preparing",
    label: "Hazırlanıyor",
    desc: "Çiçekleriniz özenle hazırlanıyor.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    key: "onway",
    label: "Yolda",
    desc: "Siparişiniz kurye ile yola çıktı.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    key: "delivered",
    label: "Teslim Edildi",
    desc: "Siparişiniz teslim edildi.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

// ── Tip ─────────────────────────────────────────────────────────
type OrderResult = {
  orderNumber: string;
  product: string;
  date: string;
  estimatedDelivery: string;
  currentStep: number;
  status: string;
  courier: string | null;
  courierPhone: string | null;
};

// ── Adım ikonu bileşeni ──────────────────────────────────────────
function StepIcon({ step, index, currentStep }: { step: typeof STEPS[0]; index: number; currentStep: number }) {
  const done = index <= currentStep;
  const active = index === currentStep;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.15 + 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
          done
            ? "bg-[#1d3435] border-[#1d3435] text-white"
            : "bg-white border-[#e0d9d2] text-[#d1c7be]"
        }`}
      >
        {step.icon}
        {active && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#3d7b74]"
            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.15 + 0.35, duration: 0.35 }}
        className="text-center hidden md:block"
      >
        <p className={`text-[12px] font-semibold tracking-wide ${done ? "text-[#1d3435]" : "text-[#c5bdb5]"}`}>
          {step.label}
        </p>
        <p className={`text-[11px] mt-0.5 max-w-[100px] leading-tight ${done ? "text-[#7a8e8f]" : "text-[#d8d0c9]"}`}>
          {step.desc}
        </p>
      </motion.div>
    </div>
  );
}

// ── Ana bileşen ──────────────────────────────────────────────────
export function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleTrackOrder(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Bir hata oluştu. Lütfen tekrar deneyin.");
      } else {
        setResult(data as OrderResult);
      }
    } catch {
      setErrorMsg("Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-start px-4 py-16 bg-[#faf8f5]">
      <div className="w-full max-w-2xl">
        {/* ── Form kartı ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#ede8e3] p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="font-sans text-3xl md:text-4xl font-medium text-[#1d3435] mb-3">
              Sipariş Takip
            </h1>
            <p className="text-[14px] text-[#888] leading-relaxed max-w-md mx-auto">
              Siparişinizin teslimat durumunu öğrenmek için{" "}
              <span className="font-semibold text-[#1d3435]">sipariş numaranızı</span> ve{" "}
              <span className="font-semibold text-[#c8746a]">e-posta adresinizi</span> girin.
            </p>
          </div>

          <form onSubmit={handleTrackOrder} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => { setOrderNumber(e.target.value); setErrorMsg(null); }}
                  placeholder="Sipariş Numaranız"
                  required
                  className="w-full border-0 border-b-2 border-[#e0d9d2] bg-transparent px-0 py-3 text-[14px] text-[#1d3435] placeholder:text-[#bbb] focus:outline-none focus:border-[#3d7b74] transition-colors duration-200"
                />
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                  placeholder="E-posta Adresiniz"
                  required
                  className="w-full border-0 border-b-2 border-[#e0d9d2] bg-transparent px-0 py-3 text-[14px] text-[#1d3435] placeholder:text-[#bbb] focus:outline-none focus:border-[#3d7b74] transition-colors duration-200"
                />
              </div>
            </div>

            {/* Hata mesajı */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-2.5 bg-[#fff5f5] border border-[#fcd5d0] rounded-xl px-4 py-3"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#e05a4b" strokeWidth="2" className="w-4 h-4 flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-[13px] text-[#c0392b] leading-snug">{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-[#1d3435] hover:bg-[#2a4e50] disabled:opacity-60 text-white px-14 py-4 rounded-xl text-[13px] font-semibold tracking-[0.08em] uppercase transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Sorgulanıyor...
                  </>
                ) : (
                  "Sorgula"
                )}
              </button>
            </div>
          </form>

          {!result && !errorMsg && (
            <p className="text-center text-[12px] text-[#bbb] mt-8">
              Sipariş numaranızı onay e-postanızda bulabilirsiniz.
            </p>
          )}
        </div>

        {/* ── Sonuç: Timeline ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 bg-white rounded-2xl shadow-sm border border-[#ede8e3] overflow-hidden"
            >
              {/* Üst bilgi bandı */}
              <div className="bg-[#1d3435] px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[11px] text-[#6dbfb8] uppercase tracking-[0.2em] font-semibold mb-0.5">
                    Sipariş Numarası
                  </p>
                  <p className="text-white font-semibold text-[15px]">{result.orderNumber}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[11px] text-[#6dbfb8] uppercase tracking-[0.2em] font-semibold mb-0.5">
                    Tahmini Teslimat
                  </p>
                  <p className="text-white font-semibold text-[15px]">{result.estimatedDelivery}</p>
                </div>
              </div>

              {/* Ürün bilgisi */}
              <div className="px-8 py-4 border-b border-[#f0ebe6] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#f3e8e0] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#c8746a" strokeWidth="1.8" className="w-4 h-4">
                    <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1d3435]">{result.product}</p>
                  <p className="text-[11px] text-[#9b8b7e]">Sipariş tarihi: {result.date}</p>
                </div>
              </div>

              {/* ── İptal / İade banner ── */}
              {(result.status === "İptal" || result.status === "İade") && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`mx-8 mt-6 flex items-start gap-3 rounded-xl px-5 py-4 border ${
                    result.status === "İptal"
                      ? "bg-red-50 border-red-200"
                      : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    result.status === "İptal" ? "bg-red-100" : "bg-orange-100"
                  }`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={result.status === "İptal" ? "#dc2626" : "#ea580c"} strokeWidth="2" className="w-5 h-5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-[14px] font-bold ${result.status === "İptal" ? "text-red-700" : "text-orange-700"}`}>
                      Sipariş {result.status === "İptal" ? "İptal Edildi" : "İade Alındı"}
                    </p>
                    <p className={`text-[13px] mt-0.5 leading-relaxed ${result.status === "İptal" ? "text-red-600" : "text-orange-600"}`}>
                      {result.status === "İptal"
                        ? "Bu sipariş iptal edilmiştir. Sorularınız için lütfen bizimle iletişime geçin."
                        : "İade talebiniz alınmıştır. İşleminiz inceleniyor, en kısa sürede dönüş yapılacaktır."}
                    </p>
                    <a
                      href="https://wa.me/905322959309"
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-1.5 mt-3 text-[12px] font-semibold hover:underline ${
                        result.status === "İptal" ? "text-red-700" : "text-orange-700"
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp ile İletişime Geç
                    </a>
                  </div>
                </motion.div>
              )}

              {/* ── Horizontal Timeline (desktop) ── */}
              <div className={`px-8 pt-8 pb-6 ${result.status === "İptal" || result.status === "İade" ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="hidden md:flex items-start justify-between relative">
                  <div className="absolute top-6 left-6 right-6 h-[2px] bg-[#ede8e3]" />
                  <motion.div
                    className="absolute top-6 left-6 h-[2px] bg-[#1d3435] origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: result.currentStep / (STEPS.length - 1) }}
                    transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
                    style={{ width: `calc(100% - 48px)` }}
                  />
                  {STEPS.map((step, i) => (
                    <StepIcon key={step.key} step={step} index={i} currentStep={result.currentStep} />
                  ))}
                </div>

                {/* Mobile: dikey */}
                <div className="md:hidden flex flex-col gap-0">
                  {STEPS.map((step, i) => {
                    const done = i <= result.currentStep;
                    const active = i === result.currentStep;
                    const isLast = i === STEPS.length - 1;
                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.12 + 0.2, duration: 0.35, type: "spring" }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                              done ? "bg-[#1d3435] border-[#1d3435] text-white" : "bg-white border-[#e0d9d2] text-[#d1c7be]"
                            } ${active ? "ring-2 ring-[#3d7b74] ring-offset-2" : ""}`}
                          >
                            {step.icon}
                          </motion.div>
                          {!isLast && (
                            <motion.div
                              className={`w-[2px] flex-1 min-h-[32px] ${done ? "bg-[#1d3435]" : "bg-[#e8e0d8]"}`}
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: i * 0.12 + 0.45, duration: 0.35 }}
                              style={{ originY: 0 }}
                            />
                          )}
                        </div>
                        <motion.div
                          className="pb-6"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.12 + 0.3, duration: 0.35 }}
                        >
                          <p className={`text-[13px] font-semibold ${done ? "text-[#1d3435]" : "text-[#c5bdb5]"}`}>
                            {step.label}
                          </p>
                          <p className={`text-[12px] mt-0.5 ${done ? "text-[#7a8e8f]" : "text-[#d8d0c9]"}`}>
                            {step.desc}
                          </p>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>

                {/* Kurye bilgisi — sadece "Yolda" (step 2) aşamasında */}
                {result.currentStep === 2 && result.courier && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    className="mt-6 flex items-center gap-3 bg-[#f5f9f8] border border-[#dceee8] rounded-xl px-5 py-4"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1d3435] flex items-center justify-center text-white flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[12px] text-[#6dbfb8] font-semibold uppercase tracking-wider">Kuryeniz</p>
                      <p className="text-[13px] font-semibold text-[#1d3435]">{result.courier}</p>
                    </div>
                    {result.courierPhone && (
                      <a
                        href={`tel:${result.courierPhone.replace(/\s/g, "")}`}
                        className="ml-auto flex items-center gap-1.5 text-[12px] text-[#3d7b74] font-semibold hover:underline"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.36 12 19.79 19.79 0 011.27 3.4 2 2 0 013.27 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        {result.courierPhone}
                      </a>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
