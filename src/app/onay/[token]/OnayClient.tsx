"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

interface OrderData {
  id: string;
  order_number: string;
  customer_name?: string | null;
  approval_image_url: string;
  approval_expires_at: string;
  approval_status: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason?: string | null;
}

type Phase = "pending" | "expired" | "approved" | "rejected";

const TOTAL_WINDOW_MS = 15 * 60 * 1000;

function getInitialPhase(order: OrderData): Phase {
  if (order.approval_status === "APPROVED") return "approved";
  if (order.approval_status === "REJECTED") return "rejected";
  const expiresAt = new Date(order.approval_expires_at).getTime();
  return Date.now() >= expiresAt ? "expired" : "pending";
}

function formatCountdown(ms: number) {
  const clamped = Math.max(0, ms);
  const totalSec = Math.floor(clamped / 1000);
  const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function OnayClient({ order, token }: { order: OrderData; token: string }) {
  const [phase, setPhase] = useState<Phase>(() => getInitialPhase(order));
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  const autoApproveFired = useRef(false);

  const expiresAtMs = useMemo(
    () => new Date(order.approval_expires_at).getTime(),
    [order.approval_expires_at]
  );
  const remainingMs = expiresAtMs - now;

  // Sayaç — "beklemede" iken saniyede bir güncellenir
  useEffect(() => {
    if (phase !== "pending") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Süre dolduğunda arayüzü değiştir
  useEffect(() => {
    if (phase === "pending" && remainingMs <= 0) setPhase("expired");
  }, [phase, remainingMs]);

  // Süre dolduğunda arka planda tek seferlik otomatik onay isteği
  useEffect(() => {
    if (phase !== "expired" || autoApproveFired.current) return;
    autoApproveFired.current = true;
    fetch("/api/orders/approve-by-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, action: "approve", auto: true }),
    }).catch(() => {});
  }, [phase, token]);

  const handleApprove = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/approve-by-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "approve" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "İşlem gerçekleştirilemedi.");
      setPhase("approved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmedik bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError("Lütfen revize edilmesini istediğiniz detayı yazın.");
      return;
    }
    setSubmitting(true);
    setRejectError(null);
    try {
      const res = await fetch("/api/orders/approve-by-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "reject", reason: rejectReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "İşlem gerçekleştirilemedi.");
      setRejectOpen(false);
      setPhase("rejected");
    } catch (err) {
      setRejectError(err instanceof Error ? err.message : "Beklenmedik bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct =
    phase === "pending" ? Math.max(0, Math.min(100, (remainingMs / TOTAL_WINDOW_MS) * 100)) : 0;

  return (
    <main className="min-h-[100dvh] bg-[#1d3435] flex flex-col items-center px-5 py-10 sm:py-14 relative overflow-hidden">
      {/* Arka plan dokusu */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <div className="relative w-full max-w-[440px]">
        {/* Marka */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="font-cormorant font-light uppercase tracking-[0.14em] text-[20px] text-white">
            Dünyanın Çiçeği
          </p>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#8bbdb9] mt-1.5">
            Sipariş Onayı
          </p>
        </motion.div>

        {/* Görsel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-xl"
        >
          <Image
            src={order.approval_image_url}
            alt="Siparişiniz için hazırlanan çiçek"
            fill
            unoptimized
            priority
            className="object-cover"
            sizes="440px"
          />
        </motion.div>

        {/* Yüzen sayaç — sadece "beklemede" iken */}
        <AnimatePresence>
          {phase === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="relative -mt-8 mx-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.35)] px-5 py-4"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9c9c]">
                  Kalan Süre
                </span>
                <span className="text-[22px] font-black tabular-nums text-[#1d3435]">
                  {formatCountdown(remainingMs)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#ede8e3] overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#3d7b74] to-[#6dbfb8] rounded-full"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.9, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Durum gövdesi */}
        <div className={phase === "pending" ? "mt-6" : "mt-8"}>
          <AnimatePresence mode="wait">
            {phase === "pending" && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="space-y-3"
              >
                <p className="text-center text-[13.5px] text-white/70 leading-relaxed mb-1">
                  Çiçeğiniz teslimata hazır. Lütfen aşağıdaki fotoğrafı inceleyip onaylayın.
                </p>
                {error && <p className="text-center text-[12.5px] text-red-300">{error}</p>}
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-bold text-[15px] py-4 rounded-2xl transition-all duration-150 shadow-[0_8px_30px_-6px_rgba(16,185,129,0.55)] disabled:opacity-60 disabled:active:scale-100"
                >
                  {submitting ? (
                    "Gönderiliyor..."
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Çiçeği Onaylıyorum
                    </>
                  )}
                </button>
                <button
                  onClick={() => setRejectOpen(true)}
                  disabled={submitting}
                  className="w-full text-center text-[13.5px] font-semibold text-white/70 hover:text-white border border-white/20 hover:border-white/40 active:scale-[0.98] rounded-2xl py-3.5 transition-all duration-150 disabled:opacity-50"
                >
                  Reddet / Yeniden Hazırlansın
                </button>
              </motion.div>
            )}

            {phase === "expired" && (
              <motion.div
                key="expired"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-white/8 border border-white/10 rounded-2xl px-6 py-8"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                  className="w-12 h-12 rounded-full bg-[#3d7b74] flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                  </svg>
                </motion.div>
                <p className="text-[14.5px] text-white leading-relaxed">
                  Süreniz dolduğu için siparişiniz sistem tarafından otomatik onaylanmış ve
                  kuryeye teslim edilmiştir.
                </p>
              </motion.div>
            )}

            {phase === "approved" && (
              <motion.div
                key="approved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-white/8 border border-white/10 rounded-2xl px-6 py-8"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                  className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <p className="text-[16px] font-semibold text-white mb-1.5">Teşekkürler!</p>
                <p className="text-[13.5px] text-white/65 leading-relaxed">
                  Siparişinizi onayladınız. Çiçekleriniz en kısa sürede yola çıkıyor.
                </p>
              </motion.div>
            )}

            {phase === "rejected" && (
              <motion.div
                key="rejected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-white/8 border border-white/10 rounded-2xl px-6 py-8"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                  className="w-12 h-12 rounded-full bg-[#c8746a] flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.div>
                <p className="text-[16px] font-semibold text-white mb-1.5">Revize Talebi Alındı</p>
                <p className="text-[13.5px] text-white/65 leading-relaxed">
                  Floristimiz notunuzu inceleyip çiçeklerinizi kısa süre içinde yeniden
                  hazırlayacak.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-[11px] text-white/30 mt-8">Sipariş No: {order.order_number}</p>
      </div>

      {/* Reddet Modal */}
      <Dialog.Root
        open={rejectOpen}
        onOpenChange={(next) => {
          if (!submitting) setRejectOpen(next);
        }}
      >
        <AnimatePresence>
          {rejectOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 bg-black/60 z-[900]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.97 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[901] w-[92vw] max-w-[420px] bg-white rounded-3xl shadow-2xl p-6 sm:p-7"
                >
                  <Dialog.Title className="font-poppins text-[17px] font-semibold text-[#1d3435]">
                    Ne değişmesini istersiniz?
                  </Dialog.Title>
                  <Dialog.Description className="text-[12.5px] text-[#8a9c9c] mt-1 mb-4">
                    Lütfen revize edilmesini istediğiniz detayı yazın:
                  </Dialog.Description>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value);
                      setRejectError(null);
                    }}
                    rows={4}
                    placeholder="Örn: Çiçekler daha açık renkli olsun, kırmızı gül eklenmesin..."
                    className="w-full border border-[#e2ddd8] rounded-xl px-4 py-3 text-[13.5px] text-[#1d3435] placeholder:text-[#c0b8b0] focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/15 transition-all resize-none"
                  />
                  {rejectError && (
                    <p className="text-[12px] text-red-600 font-medium mt-2">{rejectError}</p>
                  )}
                  <div className="flex gap-2.5 mt-5">
                    <Dialog.Close asChild>
                      <button
                        disabled={submitting}
                        className="flex-1 text-[13px] font-semibold text-[#8a9c9c] hover:text-[#1d3435] py-3 rounded-xl border border-[#e2ddd8] transition-colors disabled:opacity-50"
                      >
                        Vazgeç
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={handleReject}
                      disabled={submitting}
                      className="flex-1 text-[13px] font-bold text-white bg-[#1d3435] hover:bg-[#243f40] py-3 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {submitting ? "Gönderiliyor..." : "Gönder"}
                    </button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </main>
  );
}
