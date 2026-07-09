import type { OrderStatus } from "@/types";

export const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; step: number }> = {
  "Yeni": { color: "text-blue-700", bg: "bg-blue-100", step: 0 },
  "Hazırlanıyor": { color: "text-yellow-700", bg: "bg-yellow-100", step: 1 },
  "Kargoya Verildi": { color: "text-purple-700", bg: "bg-purple-100", step: 2 },
  "Teslim Edildi": { color: "text-green-700", bg: "bg-green-100", step: 3 },
  "İptal": { color: "text-red-700", bg: "bg-red-100", step: -1 },
  "İade": { color: "text-orange-700", bg: "bg-orange-100", step: -1 },
};
