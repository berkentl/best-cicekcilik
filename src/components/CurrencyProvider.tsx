"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/store/currencyStore";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const fetchRates = useCurrencyStore((s) => s.fetchRates);

  useEffect(() => {
    fetchRates();
    // Saatte bir yenile (sekme açık kalırsa)
    const id = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchRates]);

  return <>{children}</>;
}
