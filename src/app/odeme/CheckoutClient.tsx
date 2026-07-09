"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { calculateShipping } from "@/lib/shippingService";
import { formatPhoneInput, PHONE_PATTERN } from "@/lib/phone";
import { PlusIcon, CheckCircleIcon } from "@/components/icons";
import type { PaymentSettings, SiteSettings, Address } from "@/types";

const inputBase =
  "w-full border border-[#e2ddd8] rounded-lg px-4 py-3 text-[13px] text-[#1d3435] placeholder:text-[#c0b8b0] bg-white transition-all duration-150 " +
  "focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/15 " +
  "invalid:[&:not(:placeholder-shown)]:border-red-400 invalid:[&:not(:placeholder-shown)]:ring-2 invalid:[&:not(:placeholder-shown)]:ring-red-100";

const labelClass =
  "block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a7070] mb-1.5";

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#ede8e3] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f4f0ec] bg-[#faf8f6]">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1d3435]/8 text-[#3d7b74]">
          {icon}
        </span>
        <h2 className="font-sans text-[15px] font-semibold text-[#1d3435] tracking-[-0.01em]">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

interface Props {
  paymentSettings: PaymentSettings;
  siteSettings: Pick<SiteSettings, "baseShippingFee" | "freeShippingThreshold">;
}

export function CheckoutClient({ paymentSettings, siteSettings }: Props) {
  const router = useRouter();
  const { items, totalPrice, discountAmount, coupon, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const subtotal = totalPrice();
  const discount = discountAmount();
  const shippingResult = calculateShipping(items, null, siteSettings);
  const shipping = shippingResult.fee;
  const shippingFree = shippingResult.isFree;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    city: "İstanbul",
    deliveryDate: "",
    deliveryTime: "",
    recipientName: "",
    recipientPhone: "",
    cardMessage: "",
    notes: "",
    paymentMethod: paymentSettings.kapida_enabled ? "kapida" : paymentSettings.havale_enabled ? "havale" : "online",
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    const firstDelivery = useCartStore.getState().items[0]?.delivery;
    if (firstDelivery) {
      startTransition(() => setForm(prev => ({
        ...prev,
        deliveryDate: firstDelivery.dateIso,
        deliveryTime: firstDelivery.timeSlot,
      })));
    }
  }, []);

  // Giriş yapmış müşteri + kayıtlı adresleri
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((user) => {
        if (!user) return;
        setIsLoggedIn(true);
        startTransition(() => setForm((prev) => ({
          ...prev,
          firstName: prev.firstName || user.name?.split(" ")[0] || "",
          lastName: prev.lastName || user.name?.split(" ").slice(1).join(" ") || "",
          email: prev.email || user.email || "",
          phone: prev.phone || (user.phone ? formatPhoneInput(user.phone) : ""),
        })));
        return fetch("/api/addresses").then((r) => (r.ok ? r.json() : []));
      })
      .then((addresses: Address[] | undefined) => {
        if (addresses) setSavedAddresses(addresses);
      })
      .catch(() => {});
  }, []);

  const selectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setForm((prev) => ({
      ...prev,
      address: addr.fullAddress,
      district: addr.district,
      city: addr.city,
      recipientName: addr.recipientName,
      recipientPhone: addr.recipientPhone,
    }));
  };

  const startNewAddress = () => {
    setSelectedAddressId(null);
    setForm((prev) => ({ ...prev, address: "", district: "", city: "İstanbul" }));
  };

  const kapidaFee =
    form.paymentMethod === "kapida" && paymentSettings.kapida_enabled
      ? paymentSettings.kapida_fee
      : 0;

  const grandTotal = subtotal - discount + shipping + kapidaFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        form,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          qty: quantity,
          price: product.salePrice ?? product.price,
        })),
        total: subtotal,
        discount,
        couponCode: coupon?.code ?? null,
        grandTotal,
        kapidaFee,
      };

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Sipariş oluşturulamadı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }

      const { orderNumber } = await res.json();

      // Giriş yapmış müşteri yeni bir adres girdiyse (kayıtlı adres seçmediyse) hesabına kaydet
      if (isLoggedIn && !selectedAddressId && form.address.trim()) {
        fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.district || "Teslimat Adresi",
            recipientName: form.recipientName,
            recipientPhone: form.recipientPhone,
            city: form.city,
            district: form.district,
            fullAddress: form.address,
            isDefault: savedAddresses.length === 0,
          }),
        }).catch(() => {});
      }

      setRedirecting(true);
      clearCart();
      router.push(`/odeme/basarili?order=${orderNumber}`);
    } catch {
      alert("Bağlantı hatası. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#3d7b74]">
          <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-[14px] font-medium text-[#1d3435]">Siparişiniz oluşturuluyor…</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-site py-20 text-center">
        <p className="text-[#999] mb-6">Sepetinizde ürün yok.</p>
        <Link href="/tum-urunler" className="btn-primary">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  const availablePayments = [
    paymentSettings.kapida_enabled && {
      value: "kapida",
      label: "Kapıda Ödeme",
      sub: paymentSettings.kapida_fee > 0 ? `+₺${paymentSettings.kapida_fee.toLocaleString("tr-TR")} hizmet bedeli` : "Nakit veya Kredi Kartı",
      description:
        "Siparişiniz teslim edildiğinde kapıda ödeme yapabilirsiniz. Nakit veya POS cihazı ile kredi/banka kartı kabul edilmektedir." +
        (paymentSettings.kapida_fee > 0
          ? ` Kapıda ödeme seçeneğine ek olarak ₺${paymentSettings.kapida_fee.toLocaleString("tr-TR")} hizmet bedeli uygulanmaktadır.`
          : ""),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    paymentSettings.havale_enabled && {
      value: "havale",
      label: "Banka Havalesi / EFT",
      sub: "Önceden ödeme",
      description: null as string | null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
    },
  ].filter(Boolean) as {
    value: string;
    label: string;
    sub: string;
    description: string | null;
    icon: React.ReactNode;
  }[];

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-[#f0f0f0] py-3 bg-white">
        <div className="container-site">
          <nav className="flex items-center gap-2 text-[12px] text-[#999]">
            <Link href="/" className="hover:text-[#1d3435] transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/sepet" className="hover:text-[#1d3435] transition-colors">Sepet</Link>
            <span>/</span>
            <span className="text-[#1d3435] font-medium">Ödeme</span>
          </nav>
        </div>
      </div>

      <section className="py-10 md:py-14 bg-[#faf8f5] min-h-screen">
        <div className="container-site">
          <h1 className="font-sans text-2xl md:text-3xl text-[#1d3435] font-bold mb-8 tracking-[-0.02em]">
            Sipariş Tamamla
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

              {/* Sol — form alanları */}
              <div className="lg:col-span-2 space-y-5">

                {/* 1. Sipariş Veren */}
                <SectionCard
                  title="Sipariş Veren Bilgileri"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Ad *</label>
                      <input required type="text" placeholder="Adınız" className={inputBase}
                        value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Soyad *</label>
                      <input required type="text" placeholder="Soyadınız" className={inputBase}
                        value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Telefon *</label>
                      <input required type="tel" inputMode="numeric" placeholder="0532 000 00 00"
                        pattern={PHONE_PATTERN} title="Geçerli bir telefon numarası girin (0XXX XXX XX XX)"
                        maxLength={14} className={inputBase}
                        value={form.phone} onChange={(e) => update("phone", formatPhoneInput(e.target.value))} />
                    </div>
                    <div>
                      <label className={labelClass}>E-posta *</label>
                      <input required type="email" placeholder="ornek@mail.com" className={inputBase}
                        value={form.email} onChange={(e) => update("email", e.target.value)} />
                    </div>
                  </div>
                </SectionCard>

                {/* 2. Alıcı Bilgileri */}
                <SectionCard
                  title="Alıcı Bilgileri & Kart Mesajı"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  }
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Alıcı Adı Soyadı *</label>
                        <input required type="text" placeholder="Teslim edilecek kişi" className={inputBase}
                          value={form.recipientName} onChange={(e) => update("recipientName", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Alıcı Telefonu *</label>
                        <input required type="tel" inputMode="numeric" placeholder="0532 000 00 00"
                          pattern={PHONE_PATTERN} title="Geçerli bir telefon numarası girin (0XXX XXX XX XX)"
                          maxLength={14} className={inputBase}
                          value={form.recipientPhone} onChange={(e) => update("recipientPhone", formatPhoneInput(e.target.value))} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Kart Mesajı</label>
                      <textarea rows={3} placeholder="Çiçeğe eklenecek kart mesajınız..." className={inputBase + " resize-none"}
                        value={form.cardMessage} onChange={(e) => update("cardMessage", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Sipariş Notu</label>
                      <textarea rows={2} placeholder="Floristimize özel notunuz..." className={inputBase + " resize-none"}
                        value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                    </div>
                  </div>
                </SectionCard>

                {/* 3. Teslimat Adresi */}
                <SectionCard
                  title="Teslimat Adresi"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                >
                  <div className="space-y-4">
                    {isLoggedIn && savedAddresses.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className={labelClass}>Kayıtlı Adreslerim</label>
                          {selectedAddressId && (
                            <button type="button" onClick={startNewAddress}
                              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#3d7b74] hover:text-[#1d3435] transition-colors">
                              <PlusIcon size={13} /> Yeni Adres Ekle
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {savedAddresses.map((addr) => {
                            const selected = selectedAddressId === addr.id;
                            return (
                              <button key={addr.id} type="button" onClick={() => selectSavedAddress(addr)}
                                className={`text-left rounded-xl border-2 px-4 py-3 transition-all duration-150 ${
                                  selected
                                    ? "border-[#3d7b74] bg-[#f0f8f7] shadow-sm"
                                    : "border-[#e8e2dc] bg-white hover:border-[#b5d5d1] hover:shadow-sm"
                                }`}>
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className="text-[13px] font-semibold text-[#1d3435]">{addr.title}</p>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {addr.isDefault && (
                                      <span className="text-[9px] font-bold uppercase tracking-wide bg-[#f5f9f8] text-[#3d7b74] px-1.5 py-0.5 rounded-full">
                                        Varsayılan
                                      </span>
                                    )}
                                    {selected && <CheckCircleIcon size={16} className="text-[#3d7b74]" />}
                                  </div>
                                </div>
                                <p className="text-[12px] text-[#6e6560] leading-snug line-clamp-2">
                                  {addr.fullAddress}, {addr.district}/{addr.city}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedAddressId ? (
                      <div className="flex items-center justify-between bg-[#f0f7f3] border border-[#adceba] rounded-xl px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[#163426] uppercase tracking-[0.08em]">Seçilen Adres</p>
                          <p className="text-[13px] font-medium text-[#1b1c1c] mt-0.5 truncate">
                            {form.address}, {form.district}/{form.city}
                          </p>
                        </div>
                        <button type="button" onClick={startNewAddress}
                          className="text-[12px] text-[#163426] font-semibold underline underline-offset-2 hover:text-[#1e4434] transition-colors flex-shrink-0 ml-3">
                          Değiştir
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className={labelClass}>Açık Adres *</label>
                          <textarea required rows={3} placeholder="Cadde, sokak, bina no, daire..." className={inputBase + " resize-none"}
                            value={form.address} onChange={(e) => update("address", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>İlçe *</label>
                            <input required type="text" placeholder="Şişli" className={inputBase}
                              value={form.district} onChange={(e) => update("district", e.target.value)} />
                          </div>
                          <div>
                            <label className={labelClass}>Şehir *</label>
                            <input required type="text" className={inputBase}
                              value={form.city} onChange={(e) => update("city", e.target.value)} />
                          </div>
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Teslimat Tarihi *</label>
                        <input required type="date" className={inputBase + " block w-full min-w-0 [&::-webkit-date-and-time-value]:text-left"}
                          min={new Date().toISOString().split("T")[0]}
                          value={form.deliveryDate} onChange={(e) => update("deliveryDate", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Teslimat Saati *</label>
                        <select required className={inputBase}
                          value={form.deliveryTime} onChange={(e) => update("deliveryTime", e.target.value)}>
                          <option value="">Saat seçin</option>
                          <option value="09:00-13:00">09:00 – 13:00</option>
                          <option value="12:00-16:00">12:00 – 16:00</option>
                          <option value="14:00-20:00">14:00 – 20:00</option>
                          <option value="18:00-22:00">18:00 – 22:00</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* 4. Ödeme Yöntemi */}
                {availablePayments.length > 0 && (
                  <SectionCard
                    title="Ödeme Yöntemi"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 10h20" />
                      </svg>
                    }
                  >
                    <div className={`grid gap-3 ${availablePayments.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                      {availablePayments.map((opt) => {
                        const selected = form.paymentMethod === opt.value;
                        return (
                          <div key={opt.value}>
                            <button
                              type="button"
                              onClick={() => update("paymentMethod", opt.value)}
                              className={`w-full text-left rounded-xl border-2 px-4 py-4 transition-all duration-150 ${
                                selected
                                  ? "border-[#3d7b74] bg-[#f0f8f7] shadow-sm"
                                  : "border-[#e8e2dc] bg-white hover:border-[#b5d5d1] hover:shadow-sm"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className={`mt-0.5 flex-shrink-0 transition-colors ${selected ? "text-[#3d7b74]" : "text-[#a09890]"}`}>
                                  {opt.icon}
                                </span>
                                <div>
                                  <p className={`text-[13px] font-semibold leading-tight ${selected ? "text-[#1d3435]" : "text-[#545454]"}`}>
                                    {opt.label}
                                  </p>
                                  <p className={`text-[11px] mt-0.5 ${selected ? "text-[#3d7b74]" : "text-[#a09890]"}`}>
                                    {opt.sub}
                                  </p>
                                </div>
                                {selected && (
                                  <span className="ml-auto flex-shrink-0 w-4 h-4 rounded-full bg-[#3d7b74] flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                            </button>

                            {/* Kapıda Ödeme açıklaması */}
                            {selected && opt.description && (
                              <div className="mt-2 px-4 py-3 bg-[#f5f9f8] border border-[#c8e6e1] rounded-lg">
                                <p className="text-[12px] text-[#4a7070] leading-relaxed">
                                  {opt.description}
                                </p>
                              </div>
                            )}

                            {/* Havale IBAN listesi */}
                            {selected && opt.value === "havale" && paymentSettings.havale_ibans.length > 0 && (
                              <div className="mt-2 space-y-2">
                                <p className="text-[11px] font-bold text-[#5a7070] uppercase tracking-widest px-1">
                                  Hesap Bilgileri
                                </p>
                                {paymentSettings.havale_ibans.map((entry) => (
                                  <div key={entry.id} className="px-4 py-3 bg-[#f5f9f8] border border-[#c8e6e1] rounded-lg">
                                    <p className="text-[12px] font-semibold text-[#1d3435]">{entry.bank}</p>
                                    <p className="text-[11px] text-[#6e6560]">{entry.holder}</p>
                                    <p className="text-[12px] font-mono text-[#3d7b74] mt-1 tracking-wider select-all">
                                      {entry.iban.replace(/(.{4})/g, "$1 ").trim()}
                                    </p>
                                  </div>
                                ))}
                                <p className="text-[11px] text-[#a09890] px-1 leading-relaxed">
                                  Havale açıklamasına sipariş numaranızı yazmayı unutmayın.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                )}
              </div>

              {/* Sağ — sipariş özeti */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-[#ede8e3] shadow-sm overflow-hidden sticky top-[88px]">

                  <div className="px-5 py-4 border-b border-[#f4f0ec] bg-[#faf8f6]">
                    <h2 className="font-sans text-[15px] font-semibold text-[#1d3435]">
                      Sipariş Özeti
                    </h2>
                  </div>

                  <div className="p-5">
                    {/* Ürünler */}
                    <div className="space-y-3 mb-5">
                      {items.map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center gap-3">
                          <div className="relative w-12 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#f0ede9]">
                            <Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover" sizes="48px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-[#1d3435] font-medium leading-snug line-clamp-2">{product.name}</p>
                            <p className="text-[11px] text-[#a09890] mt-0.5">× {quantity}</p>
                          </div>
                          <span className="text-[12px] font-semibold text-[#1d3435] flex-shrink-0">
                            ₺{((product.salePrice ?? product.price) * quantity).toLocaleString("tr-TR")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Toplamlar */}
                    <div className="border-t border-[#f0ebe5] pt-4 space-y-2.5 text-[13px]">
                      <div className="flex justify-between text-[#6e6560]">
                        <span>Ara toplam</span>
                        <span>₺{subtotal.toLocaleString("tr-TR")}</span>
                      </div>
                      {discount > 0 && coupon && (
                        <div className="flex justify-between text-[#3d7b74]">
                          <span>İndirim <span className="font-mono text-[11px] bg-[#edf7f5] px-1.5 py-0.5 rounded ml-1">{coupon.code}</span></span>
                          <span className="font-semibold">-₺{discount.toLocaleString("tr-TR")}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#6e6560]">
                        <span>Teslimat</span>
                        <span className={shipping === 0 ? "text-[#3d7b74] font-semibold" : ""}>
                          {shipping === 0 ? "Ücretsiz" : `₺${shipping.toLocaleString("tr-TR")}`}
                        </span>
                      </div>
                      {kapidaFee > 0 && (
                        <div className="flex justify-between text-[#6e6560]">
                          <span>Kapıda ödeme bedeli</span>
                          <span>₺{kapidaFee.toLocaleString("tr-TR")}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#e8e2dc] mt-4 pt-4 flex justify-between items-center">
                      <span className="text-[14px] font-semibold text-[#1d3435]">Toplam</span>
                      <span className="font-bold text-[22px] text-[#1d3435] tracking-tight">
                        ₺{grandTotal.toLocaleString("tr-TR")}
                      </span>
                    </div>

                    {/* CTA */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-5 flex items-center justify-center gap-2.5 bg-[#1d3435] hover:bg-[#243f40] active:bg-[#162828] text-white font-semibold text-[14px] tracking-wide py-4 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sipariş Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Siparişi Onayla
                        </>
                      )}
                    </button>

                    {shipping > 0 && siteSettings.freeShippingThreshold > 0 && subtotal < siteSettings.freeShippingThreshold && (
                      <p className="text-[11px] text-[#3d7b74] text-center mt-3 font-medium">
                        ₺{(siteSettings.freeShippingThreshold - subtotal).toLocaleString("tr-TR")} daha ekle, kargo ücretsiz!
                      </p>
                    )}

                    <p className="text-[11px] text-[#bbb] text-center mt-3 leading-relaxed">
                      Siparişinizi onaylayarak{" "}
                      <Link href="/kullanim-kosullari" className="underline hover:text-[#1d3435] transition-colors">
                        kullanım koşullarını
                      </Link>{" "}
                      kabul etmiş olursunuz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
