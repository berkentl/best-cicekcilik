"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const STEPS = [
  {
    key: "received",
    label: "Sipariş Alındı",
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
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

interface OrderData {
  order_number: string;
  customer_name: string;
  product_name: string;
  total_amount: number;
  tracking_step: number;
  delivery_date?: string;
  delivery_time?: string;
  created_at: string;
}

interface Props {
  orderNumber?: string;
  orderData: OrderData | null;
}

export function OrderSuccessClient({ orderNumber, orderData }: Props) {
  const currentStep = orderData?.tracking_step ?? 0;

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-[#faf8f5]">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Check icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            className="relative w-24 h-24 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.15 }}
          >
            <div className="absolute inset-0 rounded-full bg-[#3d7b74]/10" />
            <motion.div
              className="absolute inset-2 rounded-full bg-[#3d7b74]/20"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-4 rounded-full bg-[#3d7b74] flex items-center justify-center">
              <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              >
                <motion.polyline
                  points="20 6 9 17 4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                />
              </motion.svg>
            </div>
          </motion.div>

          <motion.h1
            className="font-heading text-3xl md:text-4xl font-medium text-[#1d3435] mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
          >
            Siparişiniz Alındı!
          </motion.h1>

          {orderNumber && (
            <motion.div
              className="inline-flex items-center gap-2.5 bg-white border border-[#c8e6e1] rounded-xl px-5 py-2.5 shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.35 }}
            >
              <span className="text-[10px] font-bold text-[#6dbfb8] uppercase tracking-[0.18em]">Sipariş No</span>
              <span className="w-px h-3 bg-[#c8e6e1]" />
              <span className="text-[15px] font-bold text-[#1d3435]">{orderNumber}</span>
            </motion.div>
          )}
        </div>

        {/* Stepper */}
        <motion.div
          className="bg-white rounded-2xl border border-[#ede8e3] shadow-sm p-6 md:p-8 mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45 }}
        >
          <p className="text-[11px] font-bold text-[#999] uppercase tracking-[0.15em] mb-6 text-center">
            Sipariş Durumu
          </p>

          {/* Desktop stepper */}
          <div className="hidden sm:flex items-start justify-between relative">
            <div className="absolute top-5 left-5 right-5 h-[2px] bg-[#ede8e3]" />
            <motion.div
              className="absolute top-5 left-5 h-[2px] bg-[#1d3435] origin-left"
              style={{ width: "calc(100% - 40px)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: currentStep / (STEPS.length - 1) }}
              transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
            />
            {STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done ? "bg-[#1d3435] border-[#1d3435] text-white" : "bg-white border-[#e0d9d2] text-[#d1c7be]"
                    }`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.65 + i * 0.1, duration: 0.35, type: "spring", stiffness: 200 }}
                  >
                    {step.icon}
                    {active && (
                      <motion.span
                        className="absolute w-10 h-10 rounded-full border-2 border-[#3d7b74]"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </motion.div>
                  <p className={`text-[11px] font-semibold text-center leading-tight ${done ? "text-[#1d3435]" : "text-[#c5bdb5]"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Mobile stepper (vertical) */}
          <div className="sm:hidden flex flex-col gap-0">
            {STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              const isLast = i === STEPS.length - 1;
              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                        done ? "bg-[#1d3435] border-[#1d3435] text-white" : "bg-white border-[#e0d9d2] text-[#d1c7be]"
                      } ${active ? "ring-2 ring-[#3d7b74] ring-offset-1" : ""}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                    >
                      {step.icon}
                    </motion.div>
                    {!isLast && (
                      <div className={`w-[2px] flex-1 min-h-[28px] mt-1 ${done ? "bg-[#1d3435]" : "bg-[#e8e0d8]"}`} />
                    )}
                  </div>
                  <motion.div
                    className="pb-5 pt-1"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.1 }}
                  >
                    <p className={`text-[13px] font-semibold ${done ? "text-[#1d3435]" : "text-[#c5bdb5]"}`}>
                      {step.label}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Order details card */}
        {orderData && (
          <motion.div
            className="bg-white rounded-2xl border border-[#ede8e3] shadow-sm px-6 py-5 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <p className="text-[10px] text-[#999] uppercase tracking-widest font-bold mb-1">Müşteri</p>
                <p className="font-semibold text-[#1d3435]">{orderData.customer_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#999] uppercase tracking-widest font-bold mb-1">Ürün</p>
                <p className="font-semibold text-[#1d3435] truncate">{orderData.product_name}</p>
              </div>
              {orderData.delivery_date && (
                <div>
                  <p className="text-[10px] text-[#999] uppercase tracking-widest font-bold mb-1">Teslimat</p>
                  <p className="font-semibold text-[#1d3435]">{orderData.delivery_date} · {orderData.delivery_time}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-[#999] uppercase tracking-widest font-bold mb-1">Toplam</p>
                <p className="font-bold text-[#3d7b74] text-[15px]">₺{orderData.total_amount?.toLocaleString("tr-TR")}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info text */}
        <motion.p
          className="text-center text-[13px] text-[#999] mb-6 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Onay maili e-posta adresinize gönderildi. Sipariş numaranızla durumunuzu takip edebilirsiniz.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.4 }}
        >
          {orderNumber && (
            <Link
              href={`/siparis-takip?order=${orderNumber}`}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#1d3435] text-white text-[13px] font-semibold rounded-xl hover:bg-[#2a4e50] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Siparişi Sorgula
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[#1d3435] text-[#1d3435] text-[13px] font-semibold rounded-xl hover:bg-[#1d3435] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ana Sayfaya Dön
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
