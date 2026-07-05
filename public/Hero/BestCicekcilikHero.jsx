"use client";
// BestCicekcilik — Hero Carousel (React + Tailwind)
// Kurulum notları:
// 1) Fontlar (next/font ile, örn. app/layout.tsx):
//    import { Playfair_Display, Cormorant_Garamond, Great_Vibes, Jost } from "next/font/google";
//    const playfair = Playfair_Display({ subsets: ["latin-ext"], variable: "--font-playfair" });
//    const cormorant = Cormorant_Garamond({ subsets: ["latin-ext"], style: ["italic","normal"], weight: ["500"], variable: "--font-cormorant" });
//    const vibes = Great_Vibes({ subsets: ["latin-ext"], weight: "400", variable: "--font-vibes" });
//    const jost = Jost({ subsets: ["latin-ext"], variable: "--font-jost" });
//    <body className={`${playfair.variable} ${cormorant.variable} ${vibes.variable} ${jost.variable}`}>
// 2) Ham fotoğrafları /public/hero/ altına koy: bestcicek-1.png ... bestcicek-4.png
//    (yazısız 4K'lar — yazılar burada canlı HTML, SEO + responsive için en doğrusu)

import { useEffect, useState, useCallback } from "react";

const SLIDES = [
  {
    id: "yaz",
    img: "/hero/bestcicek-1.png",
    theme: { ink: "#453d2c", soft: "#8a6a2e", scrim: "250,244,230" },
    kicker: "Yaz Koleksiyonu",
    titleLines: ["Yazın", "Neşesi"],
    titleSuffix: "ile",
    brand: "BEST ÇİÇEKÇİLİK",
    copy: "Bir demet güneş, kapınızda!",
    cta: "HEMEN SİPARİŞ VER",
    href: "/koleksiyon/yaz",
    align: "left",
    mobilePos: "object-[62%_50%]",
  },
  {
    id: "sakayik",
    img: "/hero/bestcicek-2.png",
    theme: { ink: "#6e5a40", soft: "#6e5a40", scrim: "232,213,184" },
    script: ["şakayık", "sezonu"],
    scriptKicker: "taptaze",
    copy: "Sezonun en taze şakayıklarıyla sevdiklerinize mutluluk gönderin.",
    cta: "SİPARİŞ VER",
    href: "/kategori/sakayik",
    align: "left",
    mobilePos: "object-[72%_50%]",
  },
  {
    id: "gelin",
    img: "/hero/bestcicek-3.png",
    theme: { ink: "#3c3c3a", soft: "#4a4a48", scrim: "245,245,244" },
    kicker: "bir ömür boyu çiçek açsın",
    subKicker: "Düğün Sezonu",
    titleLines: ["Gelin", "Buketleri"],
    titleItalicLine: 1, // ikinci satır italik
    cta: "SİPARİŞ VER",
    href: "/kategori/gelin-buketleri",
    align: "left",
    mobilePos: "object-[70%_50%]",
  },
  {
    id: "soz-nisan",
    img: "/hero/bestcicek-4.png",
    theme: { ink: "#3f3b30", soft: "#6a6455", scrim: "238,232,220" },
    kicker: "romantikler için",
    editorial: ["SÖZ & NİŞAN", "ÇİÇEKLERİ & ÇİKOLATALARI"],
    scatter: "en güzel başlangıçlara",
    copy: "En özel anlarınıza Best Çiçekçilik zarafeti eşlik etsin",
    cta: "SİPARİŞ VER",
    href: "/kategori/soz-nisan",
    align: "right", // metin sağ panelde
    mobilePos: "object-[20%_50%]",
  },
];

function SlideText({ s }) {
  const ink = { color: s.theme.ink };
  const soft = { color: s.theme.soft };
  return (
    <div
      className={[
        "absolute inset-0 flex flex-col justify-end pb-10 px-6 text-center",
        "md:justify-center md:pb-0 md:text-left md:px-0",
        s.align === "right"
          ? "md:items-end md:pr-[6vw] md:text-center"
          : "md:items-start md:pl-[7vw]",
      ].join(" ")}
    >
      <div className={s.align === "right" ? "md:w-[34vw] md:text-center" : ""}>
        {s.kicker && (
          <p style={soft} className="[font-family:var(--font-cormorant)] italic text-lg md:text-2xl mb-2 md:mb-6">
            {s.kicker}
          </p>
        )}
        {s.scriptKicker && (
          <p style={{ color: "#fdf7e7" }} className="[font-family:var(--font-vibes)] -rotate-6 text-3xl mb-1 drop-shadow-sm">
            {s.scriptKicker}
          </p>
        )}
        {s.script && (
          <div className="-rotate-6 origin-left">
            <p style={{ color: "#fdf7e7" }} className="[font-family:var(--font-vibes)] leading-none text-7xl md:text-[10rem] drop-shadow-[2px_2px_0_rgba(110,90,62,.25)]">
              {s.script[0]}
            </p>
            <p style={{ color: "#fdf7e7" }} className="[font-family:var(--font-vibes)] leading-none text-5xl md:text-[6rem] md:ml-24 drop-shadow-[2px_2px_0_rgba(110,90,62,.25)]">
              {s.script[1]}
            </p>
          </div>
        )}
        {s.subKicker && (
          <p style={soft} className="[font-family:var(--font-cormorant)] italic text-xl md:text-4xl mb-1 md:mb-3">
            {s.subKicker}
          </p>
        )}
        {s.titleLines && (
          <h1 style={ink} className="[font-family:var(--font-playfair)] font-medium leading-[1.02] text-5xl md:text-8xl">
            {s.titleLines.map((l, i) => (
              <span key={l} className={["block", i === s.titleItalicLine ? "italic" : ""].join(" ")}>
                {l}
                {i === s.titleLines.length - 1 && s.titleSuffix && (
                  <span style={soft} className="[font-family:var(--font-cormorant)] italic text-2xl md:text-5xl ml-3 align-middle">
                    {s.titleSuffix}
                  </span>
                )}
              </span>
            ))}
          </h1>
        )}
        {s.editorial && (
          <>
            <h1 style={ink} className="[font-family:var(--font-playfair)] font-medium tracking-[.12em] text-3xl md:text-5xl">
              {s.editorial[0]}
            </h1>
            <p style={ink} className="[font-family:var(--font-playfair)] italic tracking-[.06em] text-lg md:text-3xl mt-1 md:mt-3">
              {s.editorial[1]}
            </p>
            {s.scatter && (
              <p style={soft} className="hidden md:block [font-family:var(--font-cormorant)] italic text-2xl mt-10">
                {s.scatter}
              </p>
            )}
          </>
        )}
        {s.brand && (
          <p style={ink} className="[font-family:var(--font-jost)] font-light tracking-[.45em] text-base md:text-3xl mt-2 md:mt-6">
            {s.brand}
          </p>
        )}
        {s.copy && (
          <p style={{ color: s.theme.ink }} className="[font-family:var(--font-jost)] font-light text-base md:text-2xl mt-2 md:mt-8 opacity-90">
            {s.copy}
          </p>
        )}
        <a
          href={s.href}
          style={ink}
          className="[font-family:var(--font-jost)] inline-block mt-4 md:mt-10 text-sm md:text-lg tracking-[.35em] border-b pb-1 hover:opacity-70 transition-opacity"
        >
          {s.cta}
        </a>
      </div>
    </div>
  );
}

export default function BestCicekcilikHero() {
  const [i, setI] = useState(0);
  const next = useCallback(() => setI((v) => (v + 1) % SLIDES.length), []);
  useEffect(() => {
    const t = setInterval(next, 6500);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="relative w-full aspect-[4/5] md:aspect-[2/1] overflow-hidden" aria-label="Best Çiçekçilik kampanyaları">
      {SLIDES.map((s, k) => (
        <div
          key={s.id}
          className={["absolute inset-0 transition-opacity duration-700", k === i ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")}
        >
          <img
            src={s.img}
            alt=""
            className={["h-full w-full object-cover", s.mobilePos, "md:object-center"].join(" ")}
            loading={k === 0 ? "eager" : "lazy"}
          />
          {/* mobil okunabilirlik için alt degrade — desktop'ta kapalı */}
          <div
            className="absolute inset-0 md:hidden"
            style={{ background: `linear-gradient(to bottom, rgba(${s.theme.scrim},0) 52%, rgba(${s.theme.scrim},.88) 80%, rgba(${s.theme.scrim},.96) 100%)` }}
          />
          <SlideText s={s} />
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((s, k) => (
          <button
            key={s.id}
            aria-label={`Slayt ${k + 1}`}
            onClick={() => setI(k)}
            className={["h-1.5 rounded-full transition-all", k === i ? "w-8 bg-neutral-700" : "w-3 bg-neutral-400/60"].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}
