"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
    rating?: number;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });
      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "normal" : "reverse"
      );
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      const durations = { fast: "20s", normal: "50s", slow: "80s" };
      containerRef.current.style.setProperty(
        "--animation-duration",
        durations[speed]
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-5 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="relative w-[340px] max-w-full shrink-0 rounded-2xl border border-[#e8ddd5] bg-white px-8 py-7 shadow-sm"
          >
            {/* Yıldızlar */}
            {item.rating && (
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={i < item.rating! ? "#e8a87c" : "none"}
                    stroke={i < item.rating! ? "#e8a87c" : "#d1c4b8"}
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            )}

            {/* Tırnak işareti */}
            <svg
              className="absolute top-6 right-7 opacity-10"
              width="32"
              height="24"
              viewBox="0 0 32 24"
              fill="#1d3435"
            >
              <path d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0l1.6 2.4C10.4 3.6 7.2 6.4 6.4 10.4H12V24H0zm20 0V14.4C20 6.4 24.8 1.6 34.4 0L36 2.4C30.4 3.6 27.2 6.4 26.4 10.4H32V24H20z" />
            </svg>

            <blockquote>
              <p className="relative z-20 text-[14px] leading-[1.75] text-[#4a4038] font-normal">
                {item.quote}
              </p>
              <footer className="relative z-20 mt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f3e8e0] flex items-center justify-center text-[#7a5c3e] font-semibold text-[13px]">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1d3435]">{item.name}</p>
                  <p className="text-[11px] text-[#9b8b7e]">{item.title}</p>
                </div>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
