"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  calculateShipping,
  remainingForFreeShipping,
} from "@/lib/shippingService";
import { DEFAULT_SITE_SETTINGS } from "@/lib/siteSettings";
import { CrossSellModal } from "@/components/CrossSellModal";
import type { Product } from "@/types";

/* ── useMounted ──────────────────────────────────────────────── */
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => { startTransition(() => setM(true)); }, []);
  return m;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ── Skeleton ────────────────────────────────────────────────── */
function CartSkeleton() {
  return (
    <main className="flex-1 bg-[#fbf9f8]">
      <div className="container-site py-10 md:py-16">
        <div className="h-10 w-36 bg-[#e4e2e2] rounded-full mb-2 animate-pulse" />
        <div className="h-4 w-52 bg-[#efeded] rounded-full mb-12 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-[0_4px_40px_rgba(22,52,38,0.06)] flex gap-5 animate-pulse">
                <div className="w-[110px] h-[120px] bg-[#efeded] rounded-xl flex-shrink-0"/>
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-3 w-20 bg-[#efeded] rounded-full"/>
                  <div className="h-6 w-44 bg-[#e4e2e2] rounded-full"/>
                  <div className="flex items-center justify-between mt-6">
                    <div className="h-10 w-28 bg-[#efeded] rounded-full"/>
                    <div className="h-6 w-24 bg-[#e4e2e2] rounded-full"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#f5f3f3] rounded-2xl p-6 space-y-5 animate-pulse">
            <div className="h-8 w-40 bg-[#e4e2e2] rounded-full"/>
            {[1,2].map(i => <div key={i} className="flex justify-between"><div className="h-4 w-32 bg-[#efeded] rounded-full"/><div className="h-4 w-20 bg-[#efeded] rounded-full"/></div>)}
            <div className="h-px bg-[#e4e2e2]"/>
            <div className="flex justify-between"><div className="h-7 w-20 bg-[#e4e2e2] rounded-full"/><div className="h-7 w-28 bg-[#e4e2e2] rounded-full"/></div>
            <div className="h-14 bg-[#e4e2e2] rounded-full"/>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Quantity Control ────────────────────────────────────────── */
function QuantityControl({ quantity, onIncrease, onDecrease }: {
  quantity: number; onIncrease: () => void; onDecrease: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 border border-[#e4e2e2] rounded-full px-1 py-1 bg-white">
      <button onClick={onDecrease} className="w-8 h-8 rounded-full flex items-center justify-center text-[#424844] hover:bg-[#efeded] transition-colors text-lg leading-none select-none" aria-label="Azalt">−</button>
      <span className="w-8 text-center text-[14px] font-semibold text-[#1b1c1c] select-none tabular-nums">{quantity}</span>
      <button onClick={onIncrease} className="w-8 h-8 rounded-full flex items-center justify-center text-[#424844] hover:bg-[#efeded] transition-colors text-lg leading-none select-none" aria-label="Artır">+</button>
    </div>
  );
}

/* ── Kupon Input ─────────────────────────────────────────────── */
function CouponInput({ cartTotal }: { cartTotal: number }) {
  const { coupon, applyCoupon, removeCoupon } = useCartStore();
  const [code, setCode]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/coupons/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), cartTotal }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "Kupon uygulanamadı.");
      else { applyCoupon(json); setCode(""); }
    } catch { setError("Bağlantı hatası."); }
    finally   { setLoading(false); }
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between bg-[#f0f7f3] border border-[#adceba] rounded-xl px-4 py-3">
        <div>
          <p className="text-[11px] font-bold text-[#163426] uppercase tracking-[0.1em]">{coupon.code}</p>
          <p className="text-[12px] text-[#466555] mt-0.5">
            {coupon.type === "percent" ? `%${coupon.value} indirim uygulandı` : `₺${coupon.value} indirim uygulandı`}
          </p>
        </div>
        <button onClick={removeCoupon} className="text-[#adceba] hover:text-[#ba1a1a] transition-colors p-1" aria-label="Kuponu kaldır">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex rounded-xl overflow-hidden border border-[#e4e2e2] focus-within:border-[#163426] transition-colors bg-white">
        <input type="text" value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleApply()}
          placeholder="KODUNUZU GİRİN"
          className="flex-1 px-4 py-3 text-[13px] text-[#1b1c1c] placeholder:text-[#c1c8c2] placeholder:tracking-widest focus:outline-none font-semibold tracking-widest bg-transparent"/>
        <button onClick={handleApply} disabled={loading || !code.trim()}
          className="px-5 text-[12px] font-bold text-[#163426] hover:bg-[#f5f3f3] transition-colors disabled:opacity-40 whitespace-nowrap tracking-widest border-l border-[#e4e2e2]">
          {loading ? "..." : "UYGULA"}
        </button>
      </div>
      {error && (
        <p className="text-[12px] text-[#ba1a1a] flex items-center gap-1.5 px-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Boş Sepet ───────────────────────────────────────────────── */
function EmptyCart() {
  return (
    <main className="flex-1 bg-[#fbf9f8]">
      <div className="container-site py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-[#f5f3f3] flex items-center justify-center mx-auto mb-8 shadow-[0_4px_40px_rgba(22,52,38,0.06)]">
          <svg className="w-10 h-10 text-[#c1c8c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h1 className="font-sans text-3xl md:text-[42px] text-[#1b1c1c] font-bold mb-3">Sepetiniz boş</h1>
        <p className="text-[#727973] text-[15px] mb-10 max-w-xs mx-auto leading-relaxed">Sizin için özenle hazırlanmış koleksiyonumuzu keşfedin.</p>
        <Link href="/tum-urunler"
          className="inline-flex items-center gap-2 bg-[#163426] text-white text-[13px] font-bold tracking-[0.1em] uppercase rounded-full px-8 py-4 hover:bg-[#1e4434] transition-colors shadow-[0_4px_24px_rgba(22,52,38,0.18)]">
          Alışverişe Başla
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </Link>
      </div>
    </main>
  );
}

/* ── Ana CartContent ─────────────────────────────────────────── */
export function CartContent({ siteSettings = DEFAULT_SITE_SETTINGS }: {
  siteSettings?: Pick<typeof DEFAULT_SITE_SETTINGS, "baseShippingFee" | "freeShippingThreshold">;
}) {
  const mounted = useMounted();
  const router = useRouter();
  const { items, removeItem, updateQuantity, addItem, totalPrice, discountAmount, coupon, clearCart } = useCartStore();

  const [crossSell, setCrossSell] = useState<{ active: boolean; title: string; products: Product[] } | null>(null);
  const [crossSellOpen, setCrossSellOpen] = useState(false);

  useEffect(() => {
    fetch("/api/cross-sell")
      .then((r) => r.json())
      .then(setCrossSell)
      .catch(() => setCrossSell({ active: false, title: "", products: [] }));
  }, []);

  if (!mounted) return <CartSkeleton />;

  const handleCheckoutClick = () => {
    if (crossSell?.active && crossSell.products.length > 0) {
      setCrossSellOpen(true);
    } else {
      router.push("/odeme");
    }
  };

  const handleCrossSellProceed = (selected: Product[]) => {
    selected.forEach((p) => addItem(p));
    setCrossSellOpen(false);
    router.push("/odeme");
  };

  const subtotal      = totalPrice();
  const discount      = discountAmount();
  const afterDiscount = Math.max(0, subtotal - discount);

  const shippingResult = calculateShipping(items, null, siteSettings);
  const shipping       = shippingResult.fee;
  const shippingFree   = shippingResult.isFree;
  const remaining      = remainingForFreeShipping(items, siteSettings.freeShippingThreshold);

  const grandTotal    = afterDiscount + shipping;

  if (items.length === 0) return <EmptyCart />;

  return (
    <main className="flex-1 bg-[#fbf9f8]">
      <div className="container-site py-10 md:py-16">

        <h1 className="font-sans text-[32px] md:text-[44px] font-bold text-[#1b1c1c] leading-tight mb-1">
          Sepetim
        </h1>
        <p className="text-[#727973] text-[15px] mb-10 md:mb-14">Sizin için özenle hazırlanan seçkiler.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 xl:gap-12 items-start">

          {/* ── Sol: Ürün Kartları ── */}
          <div className="space-y-4">
            {items.map(({ product, quantity, delivery }) => {
              const unitPrice = product.salePrice ?? product.price;
              const imgSrc    = product.images?.[0] ?? "/images/urunler/urun-1a.jpg";

              return (
                <article key={product.id}
                  className="bg-white rounded-2xl shadow-[0_2px_32px_rgba(22,52,38,0.07)] p-4 md:p-6 group">
                  <div className="flex gap-4 md:gap-6">
                    {/* Görsel */}
                    <Link href={`/urun/${product.slug}`}
                      className="relative w-[90px] h-[100px] md:w-[120px] md:h-[132px] flex-shrink-0 rounded-xl overflow-hidden bg-[#f5f3f3] block">
                      <Image src={imgSrc} alt={product.name} fill unoptimized
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 90px, 120px"/>
                    </Link>

                    {/* Bilgi */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {(product.subCategory ?? product.category) && (
                            <p className="text-[11px] font-semibold text-[#7c5454] uppercase tracking-[0.12em] mb-1.5">
                              {product.subCategory ?? product.category}
                            </p>
                          )}
                          <Link href={`/urun/${product.slug}`}
                            className="font-sans text-[17px] md:text-[21px] font-semibold text-[#1b1c1c] hover:text-[#163426] transition-colors leading-snug block">
                            {product.name}
                          </Link>
                        </div>
                        <button onClick={() => removeItem(product.id)}
                          className="text-[#d9a0a0] hover:text-[#ba1a1a] transition-colors p-1.5 flex-shrink-0 -mt-1 -mr-1 rounded-full hover:bg-[#fff5f5]"
                          aria-label="Ürünü kaldır">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>

                      {/* Miktar + Fiyat */}
                      <div className="flex items-center justify-between gap-2 mt-4">
                        <QuantityControl
                          quantity={quantity}
                          onIncrease={() => updateQuantity(product.id, quantity + 1)}
                          onDecrease={() => updateQuantity(product.id, quantity - 1)}
                        />
                        <span className="text-[16px] md:text-[18px] font-medium text-[#1b1c1c] tabular-nums">
                          {formatPrice(unitPrice * quantity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Teslimat Tarihi */}
                  {delivery && (
                    delivery.dateIso < todayIso() ? (
                      <div className="mt-3 pt-3 border-t border-[#f5f3f3] flex items-center gap-3 bg-[#fff8f0] -mx-4 md:-mx-6 px-4 md:px-6 py-3 rounded-b-2xl">
                        <div className="w-7 h-7 rounded-full bg-[#e8952c]/15 flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c47a1f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#c47a1f]">Teslimat Tarihi Geçmiş</p>
                          <p className="text-[13px] font-medium text-[#8a5a1a] mt-0.5">
                            Eski seçim: {delivery.dateLabel}, {delivery.timeSlot} — lütfen güncelleyin.
                          </p>
                        </div>
                        <Link href={`/urun/${product.slug}`}
                          className="text-[12px] font-semibold text-[#c47a1f] underline underline-offset-2 hover:text-[#a3630f] transition-colors flex-shrink-0 whitespace-nowrap">
                          Güncelle
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-[#f5f3f3] flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#163426]/8 flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#163426" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#727973]">Teslimat Tarihi</p>
                          <p className="text-[13px] font-medium text-[#1b1c1c] mt-0.5">{delivery.dateLabel}, {delivery.timeSlot}</p>
                        </div>
                      </div>
                    )
                  )}
                </article>
              );
            })}

            <div className="flex items-center justify-between pt-1 px-1">
              <Link href="/tum-urunler"
                className="inline-flex items-center gap-1.5 text-[13px] text-[#727973] hover:text-[#163426] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Alışverişe Devam Et
              </Link>
              <button onClick={clearCart} className="text-[12px] text-[#c1c8c2] hover:text-[#ba1a1a] transition-colors">
                Sepeti Temizle
              </button>
            </div>
          </div>

          {/* ── Sağ: Sipariş Özeti ── */}
          <div className="lg:sticky lg:top-[88px]">
            <div className="bg-[#f5f3f3] rounded-2xl p-6 md:p-8 space-y-5">

              <h2 className="font-sans text-[22px] font-bold text-[#1b1c1c] tracking-tight">Sipariş Özeti</h2>

              {/* Her ürün ayrı ayrı listele */}
              <div className="space-y-3">
                {items.map(({ product, quantity }) => {
                  const unitPrice = product.salePrice ?? product.price;
                  return (
                    <div key={product.id} className="space-y-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-sans text-[13px] font-medium text-[#424844] leading-snug flex-1 min-w-0 line-clamp-2">
                          {product.name}
                          {quantity > 1 && (
                            <span className="text-[#aaa] ml-1 text-[12px]">×{quantity}</span>
                          )}
                        </p>
                        <span className="text-[13px] font-medium text-[#1b1c1c] flex-shrink-0 tabular-nums">
                          {formatPrice(unitPrice * quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* İndirim + Kargo */}
              <div className="space-y-2 pt-1 border-t border-[#dbd9d9]">
                {discount > 0 && coupon && (
                  <div className="flex justify-between items-center text-[#163426] text-[13px] font-semibold pt-2">
                    <span className="flex items-center gap-1.5">
                      İndirim
                      <span className="text-[10px] bg-[#c8ebd6] text-[#163426] px-2 py-0.5 rounded-full">{coupon.code}</span>
                    </span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[#727973]">Gönderi Ücreti</span>
                  <span className={cn("text-[13px] font-medium tabular-nums", shippingFree ? "text-[#163426]" : "text-[#1b1c1c]")}>
                    {shippingFree ? "Ücretsiz" : shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                  </span>
                </div>
                {!shippingFree && remaining > 0 && siteSettings.freeShippingThreshold > 0 && (
                  <p className="text-[12px] text-[#7c5454] bg-[#fff5f5] rounded-xl px-3 py-2.5 leading-snug">
                    {formatPrice(remaining)} daha alın, kargo ücretsiz!
                  </p>
                )}
              </div>

              {/* Toplam */}
              <div className="border-t border-[#dbd9d9] pt-4 flex justify-between items-baseline">
                <span className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#727973]">TOPLAM</span>
                <span className="text-[22px] font-semibold text-[#1b1c1c] tabular-nums">
                  {formatPrice(grandTotal)}
                </span>
              </div>

              {/* Kupon */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#727973]">İndirim Kodu</p>
                <CouponInput cartTotal={subtotal} />
              </div>

              {/* CTA */}
              <button onClick={handleCheckoutClick}
                className="flex items-center justify-center gap-3 w-full bg-[#163426] hover:bg-[#1e4434] active:scale-[0.98] text-white text-[13px] font-bold tracking-[0.1em] uppercase rounded-full py-4 px-6 transition-all duration-200 shadow-[0_4px_24px_rgba(22,52,38,0.2)]">
                Siparişi Tamamla
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>

              {/* Güven rozetleri */}
              <div className="grid grid-cols-3 gap-3 pt-1 border-t border-[#dbd9d9]">
                {[
                  { label: "Güvenli Ödeme",  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                  { label: "Hızlı Teslimat", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                  { label: "Taze Garanti",   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex flex-col items-center gap-2 pt-4 text-center">
                    <div className="text-[#727973]">{icon}</div>
                    <span className="text-[10px] text-[#727973] leading-tight">{label}</span>
                  </div>
                ))}
              </div>


              {/* Yardım (desktop) */}
              <div className="hidden lg:block border-t border-[#dbd9d9] pt-5">
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#7c5454] mb-2">Yardım mı Lazım?</p>
                <p className="text-[13px] text-[#424844] leading-relaxed mb-3">Bir sorunuz mu var? Müşteri deneyimi ekibimiz size yardımcı olmaktan mutluluk duyar.</p>
                <a href="tel:05322959309" className="text-[14px] font-semibold text-[#163426] hover:text-[#1e4434] transition-colors">0532 295 93 09</a>
              </div>

            </div>
          </div>
        </div>
      </div>

      {crossSell && (
        <CrossSellModal
          open={crossSellOpen}
          title={crossSell.title}
          products={crossSell.products}
          onClose={() => setCrossSellOpen(false)}
          onProceed={handleCrossSellProceed}
        />
      )}
    </main>
  );
}
