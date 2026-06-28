"use client";

import { useState, useEffect } from "react";
import { XIcon, TruckIcon } from "@/components/icons";
import type { Announcement } from "@/types";

interface Props {
  announcements: Announcement[];
}

export function AnnouncementBarClient({ announcements }: Props) {
  const [visible, setVisible] = useState(true);
  const [idx, setIdx]         = useState(0);
  const [fading, setFading]   = useState(false);

  /* Duyurular arasında geçiş */
  useEffect(() => {
    if (!visible || announcements.length <= 1) return;
    const duration = (announcements[idx]?.durationSec ?? 5) * 1000;
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % announcements.length);
        setFading(false);
      }, 350);
    }, duration);
    return () => clearTimeout(timer);
  }, [idx, visible, announcements]);

  if (!visible || announcements.length === 0) return null;

  const current = announcements[idx];

  return (
    <div className="relative bg-[#1d3435] text-white text-center py-2 px-8 text-[13px] font-medium tracking-wide z-50 overflow-hidden">
      <span
        className="inline-flex items-center gap-2 transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <TruckIcon size={15} className="shrink-0" />
        {current?.text}
      </span>
      {announcements.length > 1 && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
          {announcements.map((_, i) => (
            <span
              key={i}
              className="block w-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i === idx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }}
            />
          ))}
        </span>
      )}
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity p-1"
        aria-label="Kapat"
      >
        <XIcon size={13} />
      </button>
    </div>
  );
}
