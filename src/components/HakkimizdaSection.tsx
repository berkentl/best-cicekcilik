"use client";

import type React from "react";
import { useState, useEffect, useRef, startTransition } from "react";
import Link from "next/link";
import {
  Flower2,
  Truck,
  Heart,
  Clock,
  Star,
  Gift,
  Award,
  Users,
  Smile,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Leaf,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useSpring,
  type Variants,
} from "framer-motion";

export function HakkimizdaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -20]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const services = [
    {
      icon: <Flower2 className="w-6 h-6" />,
      secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#8bbdb9]" />,
      title: "Taze Çiçekler",
      description:
        "Her sabah tedarik ettiğimiz taze çiçeklerle hazırlanan aranjmanlarımız, en uzun süre tazeliğini koruyarak sevdiklerinize ulaşır.",
      position: "left",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-[#8bbdb9]" />,
      title: "Özel Tasarım",
      description:
        "İsteklerinize göre kişiye özel buketler ve aranjmanlar hazırlıyoruz. Her tasarım, alıcının zevkine ve anın ruhuna göre şekillendirilir.",
      position: "left",
    },
    {
      icon: <Truck className="w-6 h-6" />,
      secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-[#8bbdb9]" />,
      title: "Aynı Gün Teslimat",
      description:
        "İstanbul'un tüm ilçelerine aynı gün teslimat sağlıyoruz. Soğuk zincir korumasıyla çiçekler taptaze kapınıza gelir.",
      position: "left",
    },
    {
      icon: <Gift className="w-6 h-6" />,
      secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#8bbdb9]" />,
      title: "Kişiye Özel Kart",
      description:
        "Her siparişe ücretsiz kişiselleştirilmiş kart notu ekliyoruz. Duygularınızı en güzel şekilde ifade eden kelimelerle anı unutulmaz kılıyoruz.",
      position: "right",
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-[#8bbdb9]" />,
      title: "Kurumsal Siparişler",
      description:
        "Ofis, otel ve etkinlik dekorasyonlarından düğün organizasyonlarına kadar kurumsal ihtiyaçlarınıza özel çözümler üretiyoruz.",
      position: "right",
    },
    {
      icon: <Star className="w-6 h-6" />,
      secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-[#8bbdb9]" />,
      title: "Gelin Buketi",
      description:
        "Hayatınızın en özel günü için hayalinizdeki gelin buketini birlikte tasarlıyoruz. Düğün çiçekleriniz için ücretsiz danışmanlık hizmeti sunuyoruz.",
      position: "right",
    },
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: 5000, label: "Mutlu Müşteri", suffix: "+" },
    { icon: <Award className="w-6 h-6" />, value: 10, label: "Yıllık Deneyim", suffix: "+" },
    { icon: <Smile className="w-6 h-6" />, value: 98, label: "Memnuniyet Oranı", suffix: "%" },
    { icon: <TrendingUp className="w-6 h-6" />, value: 365, label: "Gün Teslimat", suffix: "" },
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full py-24 px-4 bg-gradient-to-b from-[#f9f7f4] to-[#f5f0eb] text-[#1d3435] overflow-hidden relative"
    >
      {/* Dekoratif arka plan */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#3d7b74]/5 blur-3xl"
        style={{ y: y1, rotate: rotate1 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[#8bbdb9]/5 blur-3xl"
        style={{ y: y2, rotate: rotate2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-[#3d7b74]/20"
        animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-[#8bbdb9]/25"
        animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {/* Başlık */}
        <motion.div className="flex flex-col items-center mb-6" variants={itemVariants}>
          <motion.span
            className="text-[#3d7b74] text-[11px] font-semibold tracking-[0.2em] uppercase mb-3 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4" />
            HİKAYEMİZİ KEŞFET
          </motion.span>
          <h2 className="font-heading text-4xl md:text-5xl font-medium mb-4 text-center text-[#1d3435]">
            Hakkımızda
          </h2>
          <motion.div
            className="h-[2px] bg-[#3d7b74] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        <motion.p
          className="text-center max-w-2xl mx-auto mb-16 text-[#545454] text-[15px] leading-relaxed"
          variants={itemVariants}
        >
          Şişli/İstanbul&apos;da kurulu atölyemizde, her gün taze çiçeklerle özel tasarımlar hazırlıyoruz.
          Sevdiklerinize en güzel anları yaşatmak için titizlikle çalışıyor, her siparişe kalbimizi
          koyuyoruz.
        </motion.p>

        {/* 3 kolon grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Sol kolon */}
          <div className="space-y-16">
            {services
              .filter((s) => s.position === "left")
              .map((service, i) => (
                <ServiceItem
                  key={`left-${i}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={i * 0.2}
                  direction="left"
                />
              ))}
          </div>

          {/* Orta görsel */}
          <div className="flex justify-center items-center order-first md:order-none mb-8 md:mb-0">
            <motion.div className="relative w-full max-w-xs" variants={itemVariants}>
              <motion.div
                className="rounded-md overflow-hidden shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                {/* Görsel yakında eklenecek — şimdilik marka tonlarında bir yer tutucu */}
                <div
                  className="w-full bg-gradient-to-br from-[#dde5e1] to-[#a9bcb5]"
                  style={{ aspectRatio: "3/4" }}
                  role="img"
                  aria-label="Dünyanın Çiçeği Aranjman"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-[#1d3435]/60 to-transparent flex items-end justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <Link href="/tum-urunler">
                    <motion.span
                      className="bg-white text-[#1d3435] px-4 py-2 rounded-sm flex items-center gap-2 text-[13px] font-semibold cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Koleksiyonu Gör <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Çerçeve efekti */}
              <motion.div
                className="absolute inset-0 border-4 border-[#8bbdb9] rounded-md -m-3 z-[-1]"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />

              {/* Yüzen dekor */}
              <motion.div
                className="absolute -top-4 -right-8 w-16 h-16 rounded-full bg-[#3d7b74]/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
                style={{ y: y1 }}
              />
              <motion.div
                className="absolute -bottom-6 -left-10 w-20 h-20 rounded-full bg-[#8bbdb9]/15"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.1 }}
                style={{ y: y2 }}
              />
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#3d7b74]"
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          {/* Sağ kolon */}
          <div className="space-y-16">
            {services
              .filter((s) => s.position === "right")
              .map((service, i) => (
                <ServiceItem
                  key={`right-${i}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={i * 0.2}
                  direction="right"
                />
              ))}
          </div>
        </div>

        {/* İstatistikler */}
        <motion.div
          ref={statsRef}
          className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {stats.map((stat, i) => (
            <StatCounter
              key={i}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={i * 0.1}
            />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-16 bg-[#1d3435] text-white p-8 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-heading text-2xl font-medium mb-2">
              Sevdiklerinize Çiçek Göndermeye Hazır mısınız?
            </h3>
            <p className="text-white/70 text-[14px]">
              Aynı gün teslimat ile İstanbul&apos;un her noktasına — hemen sipariş verin.
            </p>
          </div>
          <Link href="/tum-urunler">
            <motion.span
              className="inline-flex items-center gap-2 bg-[#3d7b74] hover:bg-[#3d7b74]/90 text-white px-7 py-3 text-[13px] font-semibold uppercase tracking-wider transition-colors cursor-pointer rounded-sm"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Çiçekleri İncele <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------- ServiceItem ---------- */
interface ServiceItemProps {
  icon: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  title: string;
  description: string;
  variants: Variants;
  delay: number;
  direction: "left" | "right";
}

function ServiceItem({ icon, secondaryIcon, title, description, variants, delay, direction }: ServiceItemProps) {
  return (
    <motion.div
      className="flex flex-col group"
      variants={variants}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="flex items-center gap-3 mb-3"
        initial={{ x: direction === "left" ? -20 : 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
      >
        <motion.div
          className="text-[#3d7b74] bg-[#3d7b74]/10 p-3 rounded-sm transition-colors duration-300 group-hover:bg-[#3d7b74]/20 relative flex-shrink-0"
          whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
        >
          {icon}
          {secondaryIcon}
        </motion.div>
        <h3 className="font-heading text-[17px] font-medium text-[#1d3435] group-hover:text-[#3d7b74] transition-colors duration-300">
          {title}
        </h3>
      </motion.div>
      <p className="text-[13px] text-[#545454] leading-relaxed pl-[52px]">
        {description}
      </p>
      <div className="mt-2 pl-[52px] flex items-center text-[#3d7b74] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="flex items-center gap-1">
          Devamını gör <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}

/* ---------- StatCounter ---------- */
interface StatCounterProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix: string;
  delay: number;
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const countRef = useRef(null);
  const isInView = useInView(countRef, { once: false });
  const [hasAnimated, setHasAnimated] = useState(false);

  const springValue = useSpring(0, { stiffness: 50, damping: 10 });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value);
      startTransition(() => setHasAnimated(true));
    } else if (!isInView && hasAnimated) {
      springValue.set(0);
      startTransition(() => setHasAnimated(false));
    }
  }, [isInView, value, springValue, hasAnimated]);

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest));

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-sm p-6 rounded-sm flex flex-col items-center text-center group hover:bg-white transition-colors duration-300 border border-[#e8e4df]"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-12 h-12 rounded-full bg-[#1d3435]/5 flex items-center justify-center mb-3 text-[#3d7b74] group-hover:bg-[#3d7b74]/10 transition-colors duration-300"
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        {icon}
      </motion.div>
      <motion.div
        ref={countRef}
        className="text-3xl font-semibold text-[#1d3435] flex items-center"
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        <motion.span>{displayValue}</motion.span>
        <span>{suffix}</span>
      </motion.div>
      <p className="text-[#545454] text-[12px] mt-1" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>{label}</p>
      <motion.div className="w-8 h-[2px] bg-[#3d7b74] mt-3 group-hover:w-14 transition-all duration-300 rounded-full" />
    </motion.div>
  );
}
