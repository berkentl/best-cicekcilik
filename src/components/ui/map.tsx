"use client";

import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  showLabels?: boolean;
  animationDuration?: number;
  loop?: boolean;
}

// Türkiye koordinat sınırları (world 800×400 koordinat sistemi)
// x = (lng + 180) * (800 / 360)  |  y = (90 - lat) * (400 / 180)
// lng 25→45, lat 35.5→42.5  ⟹  x: 456→500, y: 106→121
// Padding + yay boşluğu ile viewBox:
const VB = { x: 447, y: 99, w: 76, h: 30 };
const VIEWBOX = `${VB.x} ${VB.y} ${VB.w} ${VB.h}`;

export function WorldMap({
  dots = [],
  lineColor = "#3d7b74",
  showLabels = true,
  animationDuration = 2.5,
  loop = true,
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  // Dünya haritası — viewBox crop ile Türkiye görünür
  const map = useMemo(() => new DottedMap({ height: 100, grid: "diagonal" }), []);

  const bgDataUrl = useMemo(() => {
    const svg = map.getSVG({
      radius: 0.22,
      color: "#3d7b7450",
      shape: "circle",
      backgroundColor: "transparent",
    });
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [map]);

  // lat/lng → 800×400 dünya koordinatı
  const proj = (lat: number, lng: number) => ({
    x: (lng + 180) * (800 / 360),
    y: (90 - lat) * (400 / 180),
  });

  // Yay: viewBox yüksekliği sadece 30 birim → yayı küçük tut
  const arc = (s: { x: number; y: number }, e: { x: number; y: number }) => {
    const mx = (s.x + e.x) / 2;
    const my = Math.min(s.y, e.y) - 4.5;
    return `M ${s.x} ${s.y} Q ${mx} ${my} ${e.x} ${e.y}`;
  };

  const stagger = 0.45;
  const totalAnim = dots.length * stagger + animationDuration;
  const pause = 1.5;
  const cycle = totalAnim + pause;

  return (
    <div
      className="w-full bg-[#f9f8f6] rounded-lg relative overflow-hidden"
      style={{ aspectRatio: `${VB.w} / ${VB.h}` }}
    >
      {/* Tek SVG: hem arkaplan harita hem rotalar — aynı viewBox = mükemmel hizalama */}
      <svg
        ref={svgRef}
        viewBox={VIEWBOX}
        className="w-full h-full absolute inset-0"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Arkaplan haritayı soldur/sağsoldur */}
          <linearGradient id="fade-x" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f9f8f6" />
            <stop offset="8%" stopColor="transparent" />
            <stop offset="92%" stopColor="transparent" />
            <stop offset="100%" stopColor="#f9f8f6" />
          </linearGradient>
          <linearGradient id="fade-y" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f9f8f6" />
            <stop offset="10%" stopColor="transparent" />
            <stop offset="90%" stopColor="transparent" />
            <stop offset="100%" stopColor="#f9f8f6" />
          </linearGradient>
          <mask id="map-fade">
            <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="white" />
            <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="url(#fade-x)" />
            <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="url(#fade-y)" />
          </mask>

          {/* Rota çizgisi gradyanı */}
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0" />
            <stop offset="10%" stopColor={lineColor} stopOpacity="0.9" />
            <stop offset="90%" stopColor={lineColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>

          <filter id="dot-glow">
            <feGaussianBlur stdDeviation="0.25" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Arkaplan: dünya haritası SVG, world koordinatına yerleştirildi → viewBox otomatik kırpar */}
        <image
          href={bgDataUrl}
          x="0"
          y="0"
          width="800"
          height="400"
          preserveAspectRatio="none"
          mask="url(#map-fade)"
        />

        {/* ─── Rota çizgileri ─── */}
        {dots.map((dot, i) => {
          const s = proj(dot.start.lat, dot.start.lng);
          const e = proj(dot.end.lat, dot.end.lng);
          const d = arc(s, e);
          const t0 = (i * stagger) / cycle;
          const t1 = (i * stagger + animationDuration) / cycle;
          const tR = totalAnim / cycle;

          return (
            <g key={`route-${i}`}>
              {/* Dashed animasyonlu çizgi */}
              <motion.path
                d={d}
                fill="none"
                stroke="url(#line-grad)"
                strokeWidth="0.25"
                strokeDasharray="1.2 1.6"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  loop
                    ? { pathLength: [0, 0, 1, 1, 0], opacity: [0, 0.8, 0.8, 0.8, 0] }
                    : { pathLength: 1, opacity: 0.8 }
                }
                transition={
                  loop
                    ? { duration: cycle, times: [0, t0, t1, tR, 1], ease: "easeInOut", repeat: Infinity }
                    : { duration: animationDuration, delay: i * stagger, ease: "easeInOut" }
                }
              />
              {/* Hareket eden nokta */}
              {loop && (
                <motion.circle
                  r="0.55"
                  fill={lineColor}
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{
                    offsetDistance: [null, "0%", "100%", "100%", "100%"],
                    opacity: [0, 0, 1, 0, 0],
                  }}
                  transition={{
                    duration: cycle,
                    times: [0, t0, t1, tR, 1],
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  style={{ offsetPath: `path('${d}')` }}
                />
              )}
            </g>
          );
        })}

        {/* ─── Şehir noktaları & etiketleri ─── */}
        {dots.map((dot, i) => {
          const s = proj(dot.start.lat, dot.start.lng);
          const e = proj(dot.end.lat, dot.end.lng);

          return (
            <g key={`cities-${i}`}>
              {/* Başlangıç şehri */}
              <CityDot
                x={s.x} y={s.y}
                label={showLabels ? dot.start.label : undefined}
                color={lineColor}
                onHover={setHoveredLocation}
                delay={i * 0.15}
                beginOffset="0s"
              />
              {/* Bitiş şehri */}
              <CityDot
                x={e.x} y={e.y}
                label={showLabels ? dot.end.label : undefined}
                color={lineColor}
                onHover={setHoveredLocation}
                delay={i * 0.15 + 0.1}
                beginOffset="0.4s"
              />
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip — mobil */}
      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-3 left-3 bg-[#1d3435]/90 text-white px-3 py-1.5 rounded-md text-[11px] font-semibold backdrop-blur-sm sm:hidden border border-[#3d7b74]/50"
          >
            {hoveredLocation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Şehir noktası bileşeni ──────────────────────────────────────────────────
function CityDot({
  x, y, label, color, onHover, delay, beginOffset,
}: {
  x: number; y: number;
  label?: string;
  color: string;
  onHover: (l: string | null) => void;
  delay: number;
  beginOffset: string;
}) {
  return (
    <g>
      {/* Ana nokta */}
      <motion.g
        onHoverStart={() => label && onHover(label)}
        onHoverEnd={() => onHover(null)}
        className="cursor-pointer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay, duration: 0.3, type: "spring", stiffness: 300 }}
      >
        <circle cx={x} cy={y} r="0.55" fill={color} filter="url(#dot-glow)" />
        {/* Pulse halkası */}
        <circle cx={x} cy={y} r="0.55" fill={color} opacity="0.45">
          <animate attributeName="r" from="0.55" to="2.2" dur="2s" begin={beginOffset} repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.45" to="0" dur="2s" begin={beginOffset} repeatCount="indefinite" />
        </circle>
      </motion.g>

      {/* Şehir etiketi */}
      {label && (
        <motion.text
          x={x}
          y={y - 1.3}
          textAnchor="middle"
          fontSize="1.5"
          fontWeight="500"
          fill="#2a3f40"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          className="pointer-events-none select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.4 }}
        >
          {label}
        </motion.text>
      )}
    </g>
  );
}
