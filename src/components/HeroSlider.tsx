"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { heroSlides } from "@/lib/data";

const AUTOPLAY_INTERVAL = 5000;

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
      {/* Mobil: görseller doğal boyutlarında, kırpılmadan */}
      <div className="block md:hidden relative">
        {heroSlides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 top-0 left-0 w-full transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current && !transitioning ? 1 : 0, zIndex: i === current ? 1 : 0 }}
            aria-hidden={i !== current}
          >
            <Image
              src={s.mobileImage ?? s.image}
              alt={s.alt}
              width={1080}
              height={1350}
              priority={i === 0}
              unoptimized
              className="w-full h-auto block"
            />
          </div>
        ))}
        {/* Aktif slaytı görünür tutan spacer */}
        <Image
          src={heroSlides[0].mobileImage ?? heroSlides[0].image}
          alt=""
          width={1080}
          height={1350}
          unoptimized
          aria-hidden
          className="w-full h-auto invisible"
        />
      </div>

      {/* Desktop: tam ekran, object-cover */}
      <div className="hidden md:block relative h-screen">
        {heroSlides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === current && !transitioning ? 1 : 0 }}
            aria-hidden={i !== current}
          >
            <Image
              src={s.image}
              alt={s.alt}
              fill
              priority={i === 0}
              unoptimized
              className="object-cover object-top"
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/70 hover:bg-white text-[#1d3435] shadow-sm transition-all rounded-sm"
        aria-label="Önceki"
      >
        <ArrowLeftIcon size={16} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/70 hover:bg-white text-[#1d3435] shadow-sm transition-all rounded-sm"
        aria-label="Sonraki"
      >
        <ArrowRightIcon size={16} />
      </button>

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
