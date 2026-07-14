"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#faf8f5]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] bg-white rounded-2xl shadow-sm border border-[#ede8e3] p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <Link
            href="/"
            className="font-cormorant font-light text-[#1a2e2f] uppercase tracking-[0.08em] text-[17px] inline-block mb-6"
          >
            Dünyanın Çiçeği
          </Link>
          <h1 className="font-poppins text-2xl md:text-[26px] font-semibold text-[#1d3435] mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-[#8a9c9c] leading-relaxed">{subtitle}</p>
          )}
        </div>

        {children}

        {footer && <div className="mt-7 text-center text-[13px] text-[#8a9c9c]">{footer}</div>}
      </motion.div>
    </div>
  );
}
