import type { Currency, Rates } from "@/store/currencyStore";

const FALLBACK_RATES: Rates = { TRY: 1, USD: 0.027, EUR: 0.025 };

const SYMBOLS: Record<Currency, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

export function formatPrice(
  tryAmount: number,
  currency: Currency,
  rates: Rates = FALLBACK_RATES
): string {
  const rate = rates[currency] ?? 1;
  const amount = tryAmount * rate;
  const symbol = SYMBOLS[currency];

  if (currency === "TRY") {
    return `₺${amount.toLocaleString("tr-TR")}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

export function currencySymbol(currency: Currency): string {
  return SYMBOLS[currency];
}
