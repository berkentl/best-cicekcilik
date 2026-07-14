"use client";

import { motion } from "framer-motion";
import { DeliveryGlobe } from "@/components/ui/cobe-globe";

const stats = [
  {
    value: "Aynı Gün",
    label: "İstanbul İçi Teslimat",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "81 İl",
    label: "Türkiye Geneli Kargo",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    value: "%100",
    label: "Taze Çiçek Garantisi",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    value: "+10.000",
    label: "Mutlu Müşteri",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

export function DeliverySection() {
  return (
    <section className="relative bg-[#1d3435] overflow-hidden">
      {/* Arka plan doku */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="container-site py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center">

          {/* ── Sol: Metin + İstatistikler ── */}
          <div className="order-2 lg:order-1">
            {/* Etiket */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6dbfb8] mb-4"
            >
              Hızlı & Güvenli Teslimat
            </motion.p>

            {/* Başlık */}
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="font-montserrat text-3xl md:text-4xl text-white font-medium mb-5 leading-tight"
            >
              Türkiye&apos;nin Her
              <br />
              <span className="text-[#6dbfb8]">Köşesine Çiçek</span>
              <br />
              Götürüyoruz
            </motion.h2>

            {/* Açıklama */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-white/55 text-[14px] leading-relaxed mb-8 max-w-md"
            >
              İstanbul merkezimizden sevkiyat yapılan taze çiçeklerimiz,
              özel soğuk zincir kuryelerimizle aynı gün kapınıza ulaşıyor.
              Yurt içi kargo ile sevdiklerinize uzaktan da sevginizi gönderin.
            </motion.p>

            {/* İstatistik ızgarası */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.22 + i * 0.08 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3 hover:bg-white/8 hover:border-[#3d7b74]/50 transition-all"
                >
                  <span className="text-[#6dbfb8] mt-0.5 flex-shrink-0">{s.icon}</span>
                  <div>
                    <p
                      className="text-white font-semibold text-xl leading-tight"
                      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      {s.value}
                    </p>
                    <p
                      className="text-white/45 text-[11px] mt-0.5 leading-snug tracking-wide"
                      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      {s.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

          {/* ── Sağ: 3D Globe ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="order-1 lg:order-2 flex items-center justify-center"
          >
            <div className="relative w-full max-w-[460px] mx-auto">
              {/* Globe'un arkasındaki parlama efekti */}
              <div className="absolute inset-0 rounded-full bg-[#3d7b74]/20 blur-[60px] scale-75 pointer-events-none" />

              <DeliveryGlobe className="w-full drop-shadow-2xl" speed={0.004} />

              {/* İstanbul etiketi */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute top-[38%] left-[28%] pointer-events-none"
              >
                <div className="flex items-center gap-1.5 bg-[#1d3435]/80 backdrop-blur-sm border border-[#3d7b74]/50 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6dbfb8] animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-white whitespace-nowrap">İstanbul</span>
                </div>
              </motion.div>

              {/* Sürüklenebilir ipucu */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/25 whitespace-nowrap flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
                Sürükleyerek döndürebilirsiniz
              </motion.p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
