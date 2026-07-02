import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

export interface DeliverySlot {
  dateIso:   string; // "2026-06-29"
  dateLabel: string; // "29 Haziran, Pazartesi"
  timeSlot:  string; // "14:00-20:00"
}

export interface CartItem {
  product:  Product;
  quantity: number;
  delivery?: DeliverySlot;
}

export interface AppliedCoupon {
  code:     string;
  type:     "percent" | "fixed";
  value:    number;
  discount: number;
}

export interface CartFlash { product: Product; quantity: number; }

interface CartStore {
  items:    CartItem[];
  coupon:   AppliedCoupon | null;
  flash:    CartFlash | null;
  clearFlash: () => void;
  addItem:         (product: Product) => void;
  removeItem:      (productId: string) => void;
  updateQuantity:  (productId: string, quantity: number) => void;
  setDelivery:     (productId: string, delivery: DeliverySlot) => void;
  clearCart:       () => void;
  applyCoupon:     (coupon: AppliedCoupon) => void;
  removeCoupon:    () => void;
  totalItems:      () => number;
  totalPrice:      () => number;
  discountAmount:  () => number;
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:  [],
      coupon: null,
      flash:  null,

      clearFlash: () => set({ flash: null }),

      addItem: (product) => {
        const existing = get().items.find((i) => i.product.id === product.id);
        const newQty = existing ? existing.quantity + 1 : 1;
        if (existing) {
          set({ items: get().items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ), flash: { product, quantity: newQty } });
        } else {
          set({ items: [...get().items, { product, quantity: 1 }], flash: { product, quantity: 1 } });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product.id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        set({ items: get().items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )});
      },

      setDelivery: (productId, delivery) =>
        set({ items: get().items.map((i) =>
          i.product.id === productId ? { ...i, delivery } : i
        )}),

      clearCart:    () => set({ items: [], coupon: null }),
      applyCoupon:  (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      totalItems:  () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice:  () => get().items.reduce(
        (s, i) => s + (i.product.salePrice ?? i.product.price) * i.quantity, 0
      ),
      discountAmount: () => {
        const coupon = get().coupon;
        if (!coupon) return 0;
        if (coupon.type === "percent") {
          // Her sepet değişikliğinde yüzdeyi yeniden hesapla
          return Math.round(get().totalPrice() * coupon.value / 100);
        }
        // Sabit indirim: sepet toplamını aşamaz
        return Math.min(coupon.value, get().totalPrice());
      },
    }),
    { name: "best-cicekcilik-cart", skipHydration: true }
  )
);

useCartStore.subscribe((state) => {
  const count = state.items.reduce((s, i) => s + i.quantity, 0);
  setCookie("cart-count", String(count));
});
