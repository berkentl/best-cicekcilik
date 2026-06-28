"use client";

import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";

interface GlobeProps {
  className?: string;
  speed?: number;
}

const MARKERS: { location: [number, number]; size: number }[] = [];

export function DeliveryGlobe({ className = "", speed = 0.004 }: GlobeProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const interacting  = useRef<{ x: number; y: number } | null>(null);
  const drag         = useRef({ phi: 0, theta: 0 });
  const phiBase      = useRef(0.62);   // Türkiye boylamı için başlangıç phi
  const thetaBase    = useRef(0.35);
  const paused       = useRef(false);

  const onDown = useCallback((e: React.PointerEvent) => {
    interacting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    paused.current = true;
  }, []);

  const onUp = useCallback(() => {
    if (interacting.current) {
      phiBase.current   += drag.current.phi;
      thetaBase.current += drag.current.theta;
      drag.current = { phi: 0, theta: 0 };
    }
    interacting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    paused.current = false;
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!interacting.current) return;
      drag.current = {
        phi:   (e.clientX - interacting.current.x) / 250,
        theta: (e.clientY - interacting.current.y) / 800,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup",   onUp,   { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
  }, [onUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // eslint-disable-next-line prefer-const
    let globe: ReturnType<typeof createGlobe> | null = null;
    let rafId = 0;
    let phi = 0.62;

    function init() {
      const w = canvas!.offsetWidth;
      if (w === 0 || globe) return;

      globe = createGlobe(canvas!, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width:  w * 2,
        height: w * 2,
        phi:    0.62,
        theta:  0.35,
        dark:      1,
        diffuse:   1.8,
        mapSamples:   20000,
        mapBrightness: 8,
        baseColor:   [0.08, 0.18, 0.18],  // #1d3435 teması
        markerColor: [0.45, 0.92, 0.82],  // parlak teal
        glowColor:   [0.12, 0.38, 0.35],  // teal glow
        markers: MARKERS,
      });

      function animate() {
        if (!paused.current) phi += speed;
        globe!.update({
          phi:   phi + phiBase.current - 0.62 + drag.current.phi,
          theta: thetaBase.current     + drag.current.theta,
          width:  canvas!.offsetWidth * 2,
          height: canvas!.offsetWidth * 2,
        });
        rafId = requestAnimationFrame(animate);
      }
      animate();

      setTimeout(() => { if (canvas) canvas.style.opacity = "1"; }, 100);
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if ((entries[0]?.contentRect.width ?? 0) > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (rafId)  cancelAnimationFrame(rafId);
      if (globe)  globe.destroy();
    };
  }, [speed]);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        style={{
          width: "100%", height: "100%",
          cursor: "grab", opacity: 0,
          transition: "opacity 1.4s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
    </div>
  );
}
