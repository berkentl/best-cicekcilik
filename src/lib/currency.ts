export function formatPrice(tryAmount: number): string {
  return `₺${tryAmount.toLocaleString("tr-TR")}`;
}
