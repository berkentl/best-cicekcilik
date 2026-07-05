"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { heroSlides } from "@/lib/data";

const AUTOPLAY_INTERVAL = 5000;

const arrowButtonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.08 },
};

function HeroNavButton({
  direction,
  onClick,
  label,
  className,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
  className: string;
}) {
  const Icon = direction === "prev" ? ArrowLeftIcon : ArrowRightIcon;
  const shift = direction === "prev" ? -3 : 3;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.94 }}
      variants={arrowButtonVariants}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={[
        "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full",
        "border border-white/30 bg-white/20 text-[#1d3435] backdrop-blur-md",
        "shadow-[0_4px_20px_-6px_rgba(0,0,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        className,
      ].join(" ")}
    >
      <motion.span
        variants={{ rest: { x: 0 }, hover: { x: shift } }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        className="flex items-center justify-center"
      >
        <Icon size={17} />
      </motion.span>
    </motion.button>
  );
}

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setTransitioning(false);
      }, 300);
    },
    [transitioning]
  );

  const prev = () => goTo((current - 1 + heroSlides.length) % heroSlides.length);
  const next = useCallback(
    () => goTo((current + 1) % heroSlides.length),
    [current, goTo]
  );

  useEffect(() => {
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full bg-[#f5f0eb]">
      {/* Mobil: görseller 4:5 oranında üretildi, tam gösterilir — kırpma yok */}
      <div className="block md:hidden relative w-full aspect-[4/5] overflow-hidden">
        {heroSlides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current && !transitioning ? 1 : 0, zIndex: i === current ? 1 : 0 }}
            aria-hidden={i !== current}
          >
            <Link href={s.buttonHref ?? "#"} className="absolute inset-0 block" tabIndex={i === current ? 0 : -1}>
              <Image
                src={s.mobileImage ?? s.image}
                alt={s.alt}
                fill
                priority={i === 0}
                unoptimized
                className="object-cover"
                sizes="100vw"
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Desktop: görseller 2:1 oranında üretildi, tam gösterilir — kırpma yok */}
      <div className="hidden md:block relative w-full aspect-[2/1] overflow-hidden">
        {heroSlides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current && !transitioning ? 1 : 0 }}
            aria-hidden={i !== current}
          >
            <Link href={s.buttonHref ?? "#"} className="absolute inset-0 block" tabIndex={i === current ? 0 : -1}>
              <Image
                src={s.image}
                alt={s.alt}
                fill
                priority={i === 0}
                unoptimized
                className="object-cover"
                sizes="100vw"
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Prev / Next — cam dokulu premium kontrol butonları */}
      <HeroNavButton direction="prev" onClick={prev} label="Önceki" className="left-4 md:left-6" />
      <HeroNavButton direction="next" onClick={next} label="Sonraki" className="right-4 md:right-6" />

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              background: i === current ? "#1d3435" : "rgba(255,255,255,0.6)",
            }}
            aria-label={`Slayt ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
