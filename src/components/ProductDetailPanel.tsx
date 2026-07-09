"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useCartStore, type DeliverySlot } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { formatPrice } from "@/lib/currency";
import { HeartIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { BestsellerBadge } from "@/components/ui/award-badge";
import type { Product, SiteSettings } from "@/types";


function buildShippingLines(
  _product: Product,
  _settings?: SiteSettings,
  customText?: string
): string {
  return customText?.trim() ?? "";
}

function AccordionList({ lines }: { lines: string }) {
  return (
    <ul className="space-y-2 pl-1">
      {lines.split("\n").filter(Boolean).map((line, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-[#3d7b74] mt-0.5">✦</span>
          <span dangerouslySetInnerHTML={{ __html: line }} />
        </li>
      ))}
    </ul>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#e4e2e2]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-[14px] font-semibold text-[#1b1c1c] tracking-[0.02em]">{title}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#727973" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          className={cn("transition-transform duration-300 flex-shrink-0", open && "rotate-180")}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", open ? "max-h-[2000px] pb-4" : "max-h-0")}>
        <div className="text-[14px] text-[#424844] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/* ── Teslimat Tarih/Saat Yardımcıları ───────────────────────── */
const TR_DAYS   = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const TIME_SLOTS = ["09:00-13:00","12:00-16:00","14:00-20:00","18:00-22:00"];
interface DayOption { iso: string; label: string; short: string; isToday: boolean; isTomorrow: boolean; }

function isoToDayOption(iso: string): DayOption {
  const [y, mo, dd] = iso.split("-").map(Number);
  const d = new Date(y, mo - 1, dd);
  const day   = TR_DAYS[d.getDay()];
  const month = TR_MONTHS[d.getMonth()];
  return {
    iso,
    label: `${d.getDate()} ${month}, ${day}`,
    short: `${d.getDate()} ${month.slice(0,3)}`,
    isToday: false,
    isTomorrow: false,
  };
}

function localIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getDeliveryDays(): DayOption[] {
  const now   = new Date();
  const start = now.getHours() < 14 ? 0 : 1;
  return Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() + start + idx);
    const iso   = localIso(d);
    const day   = TR_DAYS[d.getDay()];
    const month = TR_MONTHS[d.getMonth()];
    return {
      iso,
      label: `${d.getDate()} ${month}, ${day}`,
      short: `${d.getDate()} ${month.slice(0,3)}`,
      isToday:    start + idx === 0,
      isTomorrow: start + idx === 1,
    };
  });
}

function InlineDeliveryPicker({ value, onConfirm }: {
  value: DeliverySlot | null;
  onConfirm: (slot: DeliverySlot) => void;
}) {
  const days = getDeliveryDays();
  const [selectedDay, setSelectedDay] = useState<DayOption>(
    value ? (days.find(d => d.iso === value.dateIso) ?? isoToDayOption(value.dateIso)) : days[0]
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(value?.timeSlot ?? null);
  const calendarRef = useRef<HTMLInputElement>(null);

  const minDate = localIso(new Date());
  const isCustomDay = !days.some(d => d.iso === selectedDay.iso);

  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    setSelectedDay(isoToDayOption(e.target.value));
  };

  return (
    <div className="bg-[#f9f8f6] rounded-2xl p-4 border border-[#e4e2e2] space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#727973] mb-2">Teslimat Günü</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {days.map(d => (
            <button key={d.iso} type="button" onClick={() => setSelectedDay(d)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border text-center transition-all duration-150 min-w-[68px]",
                selectedDay.iso === d.iso
                  ? "border-[#163426] bg-[#163426] text-white"
                  : "border-[#e4e2e2] bg-white text-[#424844] hover:border-[#163426]/40"
              )}>
              <span className="text-[10px] font-semibold tracking-wide">
                {d.isToday ? "BUGÜN" : d.isTomorrow ? "YARIN" : d.short.split(" ")[1]?.toUpperCase()}
              </span>
              <span className="text-[15px] font-heading font-medium">{d.short.split(" ")[0]}</span>
            </button>
          ))}

          {/* + butonu → takvim */}
          <div className="relative flex-shrink-0">
            <button type="button"
              onClick={() => calendarRef.current?.showPicker?.()}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-2.5 rounded-xl border text-center transition-all duration-150 min-w-[68px] h-full",
                isCustomDay
                  ? "border-[#163426] bg-[#163426] text-white"
                  : "border-[#e4e2e2] bg-white text-[#424844] hover:border-[#163426]/40"
              )}>
              {isCustomDay ? (
                <>
                  <span className="text-[10px] font-semibold tracking-wide">{selectedDay.short.split(" ")[1]?.toUpperCase()}</span>
                  <span className="text-[15px] font-heading font-medium">{selectedDay.short.split(" ")[0]}</span>
                </>
              ) : (
                <span className="text-[22px] font-light leading-none">+</span>
              )}
            </button>
            <input
              ref={calendarRef}
              type="date"
              min={minDate}
              value={isCustomDay ? selectedDay.iso : ""}
              onChange={handleCalendarChange}
              className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
            />
          </div>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#727973] mb-2">Teslimat Saati</p>
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map(slot => (
            <button key={slot} type="button" onClick={() => setSelectedTime(slot)}
              className={cn(
                "py-2.5 px-3 rounded-xl border text-[13px] font-semibold transition-all duration-150",
                selectedTime === slot
                  ? "border-[#163426] bg-[#163426] text-white"
                  : "border-[#e4e2e2] bg-white text-[#424844] hover:border-[#163426]/40"
              )}>
              {slot}
            </button>
          ))}
        </div>
      </div>
      <button type="button"
        onClick={() => {
          if (!selectedTime) return;
          onConfirm({ dateIso: selectedDay.iso, dateLabel: selectedDay.label, timeSlot: selectedTime });
        }}
        disabled={!selectedTime}
        className="w-full py-2.5 rounded-xl bg-[#163426] text-white text-[13px] font-bold tracking-wide disabled:opacity-40 hover:bg-[#1e4434] active:scale-[0.98] transition-all">
        Onayla
      </button>
    </div>
  );
}

interface Props {
  product: Product;
  categorySlug: string;
  inStock: boolean;
  shippingInfo?: string;  // Admin'den gelen özel metin (her satır = madde)
  siteSettings?: SiteSettings;
}

export function ProductDetailPanel({ product, categorySlug, inStock, shippingInfo, siteSettings }: Props) {
  const [added, setAdded]               = useState(false);
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot | null>(null);
  const [showPicker, setShowPicker]     = useState(true);
  const [deliveryError, setDeliveryError] = useState(false);

  const addItem    = useCartStore(s => s.addItem);
  const setDelivery = useCartStore(s => s.setDelivery);
  const { toggle, has } = useWishlistStore();
  const wishlisted      = has(product.id);
  const currency        = useCurrencyStore(s => s.currency);
  const rates           = useCurrencyStore(s => s.rates);

  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    if (!deliverySlot) {
      setDeliveryError(true);
      setShowPicker(true);
      return;
    }
    addItem(product);
    setDelivery(product.id, deliverySlot);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">

      <Link href={`/${categorySlug}`}
        className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#727973] hover:text-[#1d3435] transition-colors">
        {product.category}
      </Link>

      <h1 className="font-sans text-[32px] md:text-[38px] font-bold text-[#163426] leading-tight">
        {product.name}
      </h1>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[24px] font-semibold text-[#163426] tabular-nums">
          {formatPrice(product.salePrice ?? product.price, currency, rates)}
        </span>
        {hasDiscount && <span className="text-[16px] text-[#727973] line-through">{formatPrice(product.price, currency, rates)}</span>}
        {product.isNew && <span className="bg-[#fde8e6] text-[#5c2020] text-[11px] font-semibold tracking-[0.06em] px-3 py-1 rounded-full">Yeni Ürün</span>}
        {product.isBestseller && (
          <span className="inline-block w-[180px] align-middle">
            <BestsellerBadge />
          </span>
        )}
        {hasDiscount && <span className="bg-[#7b3535] text-white text-[11px] font-semibold px-3 py-1 rounded-full">-%{discountPct}</span>}
      </div>

      {product.description && (
        <div className="rounded-2xl bg-[#f8f6f3] border border-[#e8e3dc] overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#e8e3dc] bg-[#f2efe9]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3d7b74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a7070]">Ürün Açıklaması</span>
          </div>
          <div
            className="px-4 py-4 text-[13.5px] text-[#424844] leading-[1.75] prose prose-sm max-w-none
              prose-p:my-1.5 prose-strong:text-[#1d3435] prose-strong:font-semibold
              prose-em:text-[#5a7070] prose-em:not-italic prose-ul:my-1.5 prose-li:my-0.5"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      <div className="border-t border-[#e4e2e2]" />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold tracking-[0.06em] uppercase text-[#424844]">Teslimat Tarihi &amp; Saati</label>
          {deliverySlot && !showPicker ? (
            <div className="flex items-center justify-between bg-[#f0f7f3] border border-[#adceba] rounded-xl px-4 py-3">
              <div>
                <p className="text-[11px] font-bold text-[#163426] uppercase tracking-[0.08em]">Teslimat Zamanı</p>
                <p className="text-[13px] font-semibold text-[#1b1c1c] mt-0.5">{deliverySlot.dateLabel}, {deliverySlot.timeSlot}</p>
              </div>
              <button type="button" onClick={() => setShowPicker(true)}
                className="text-[12px] text-[#163426] font-semibold underline underline-offset-2 hover:text-[#1e4434] transition-colors flex-shrink-0">
                Değiştir
              </button>
            </div>
          ) : (
            <InlineDeliveryPicker
              value={deliverySlot}
              onConfirm={(slot) => { setDeliverySlot(slot); setShowPicker(false); setDeliveryError(false); }}
            />
          )}
          {deliveryError && !deliverySlot && (
            <p className="text-[12.5px] text-[#b0685f] flex items-center gap-1.5 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Sepete eklemeden önce lütfen teslimat tarihi ve saati seçip onaylayın.
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-1">
        <button onClick={handleAddToCart} disabled={!inStock}
          className={cn("flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-[15px] font-semibold tracking-[0.03em] text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
            added ? "bg-[#3d7b74]" : "bg-[#163426] hover:bg-[#1e4434] active:scale-[0.98]")}>
          {added ? (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Sepete Eklendi</>
          ) : (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>{!inStock ? "Stokta Yok" : "Sipariş Ver"}</>
          )}
        </button>
        <button onClick={() => toggle(product)} aria-label={wishlisted ? "Favorilerden çıkar" : "Favorilere ekle"}
          className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200",
            wishlisted ? "border-[#fde8e6] bg-[#fde8e6] text-[#c4806a]" : "border-[#e4e2e2] bg-white text-[#424844] hover:border-[#fde8e6] hover:bg-[#fde8e6] hover:text-[#c4806a]")}>
          <HeartIcon size={18} className={wishlisted ? "fill-[#c4806a] stroke-[#c4806a]" : ""} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 py-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[#727973]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          %100 Güvenli Alışveriş
        </div>
        <div className="flex items-center gap-4 text-[#c1c8c2]">
          <svg viewBox="0 0 48 20" width="48" height="20" fill="currentColor"><rect x="2" y="4" width="10" height="12" rx="2"/><rect x="16" y="2" width="8" height="16" rx="2"/><rect x="28" y="6" width="18" height="8" rx="2"/></svg>
          <svg width="26" height="18" viewBox="0 0 26 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="24" height="16" rx="3"/><line x1="1" y1="6" x2="25" y2="6"/><line x1="5" y1="12" x2="9" y2="12"/></svg>
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="8" width="14" height="10" rx="2.5"/><path d="M4 8V5a4 4 0 1 1 8 0v3"/></svg>
        </div>
      </div>

      <div>
        {product.careInstructions?.trim() && (
          <Accordion title="Bakım Talimatları">
            <AccordionList lines={product.careInstructions} />
          </Accordion>
        )}
        {buildShippingLines(product, siteSettings, shippingInfo).trim() && (
          <Accordion title="Gönderim Bilgileri">
            <AccordionList lines={buildShippingLines(product, siteSettings, shippingInfo)} />
          </Accordion>
        )}
        <div className="border-t border-[#e4e2e2]" />
      </div>

    </div>
  );
}
