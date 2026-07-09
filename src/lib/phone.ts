/** Kullanıcı yazarken çağrılır — rakam olmayanları atar, "0XXX XXX XX XX" olarak gruplar. */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 7));
  if (digits.length > 7) parts.push(digits.slice(7, 9));
  if (digits.length > 9) parts.push(digits.slice(9, 11));
  return parts.join(" ");
}

/** Sunucu tarafı / Zod doğrulaması için: 0 ile başlayan 11 haneli bir numara mı? */
export function isValidTurkishPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return /^0\d{10}$/.test(digits);
}

export const PHONE_PATTERN = "^0\\d{3} \\d{3} \\d{2} \\d{2}$";
