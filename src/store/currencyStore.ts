import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "TRY" | "USD" | "EUR";

export type Rates = Record<Currency, number>;

const FALLBACK_RATES: Rates = { TRY: 1, USD: 0.027, EUR: 0.025 };

interface CurrencyState {
  currency: Currency;
  rates: Rates;
  ratesUpdatedAt: string | null;
  setCurrency: (c: Currency) => void;
  fetchRates: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "TRY",
      rates: FALLBACK_RATES,
      ratesUpdatedAt: null,

      setCurrency: (currency) => set({ currency }),

      fetchRates: async () => {
        try {
          const res = await fetch("/api/exchange-rates");
          if (!res.ok) return;
          const data = await res.json() as { TRY: number; USD: number; EUR: number; updatedAt: string | null };
          set({
            rates: { TRY: 1, USD: data.USD, EUR: data.EUR },
            ratesUpdatedAt: data.updatedAt,
          });
        } catch {
          // ağ hatası — mevcut kurlar geçerli kalır
        }
      },
    }),
    { name: "currency", partialize: (s) => ({ currency: s.currency }) }
  )
);
