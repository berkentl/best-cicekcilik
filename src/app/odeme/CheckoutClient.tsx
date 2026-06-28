"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

const inputClass =
  "w-full border border-[#e8e8e8] rounded-sm px-4 py-2.5 text-[13px] text-[#1d3435] placeholder:text-[#bbb] focus:outline-none focus:border-[#3d7b74] transition-colors bg-white";

const labelClass =
  "block text-[11px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1.5";

export function CheckoutClient() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const total = totalPrice();
  const shipping = total >= 500 ? 0 : 49.9;
  const grandTotal = total + shipping;

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
    paymentMethod: "kapida",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      clearCart();
      router.push("/odeme/basarili");
    }, 1200);
  };

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

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-[#f0f0f0] py-3">
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

      <section className="py-10 md:py-14">
        <div className="container-site">
          <h1 className="font-heading text-2xl md:text-3xl text-[#1d3435] font-medium mb-8">
            Sipariş Tamamla
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sol — form */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white border border-[#f0f0f0] rounded-sm p-6">
                  <h2 className="font-heading text-lg text-[#1d3435] font-medium mb-5">
                    Sipariş Veren Bilgileri
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Ad *</label>
                      <input required type="text" placeholder="Adınız" className={inputClass}
                        value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Soyad *</label>
                      <input required type="text" placeholder="Soyadınız" className={inputClass}
                        value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Telefon *</label>
                      <input required type="tel" placeholder="0532 000 00 00" className={inputClass}
                        value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>E-posta *</label>
                      <input required type="email" placeholder="ornek@mail.com" className={inputClass}
                        value={form.email} onChange={(e) => update("email", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#f0f0f0] rounded-sm p-6">
                  <h2 className="font-heading text-lg text-[#1d3435] font-medium mb-5">
                    Teslimat Adresi
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Açık Adres *</label>
                      <textarea required rows={3} placeholder="Cadde, sokak, bina no, daire..." className={inputClass + " resize-none"}
                        value={form.address} onChange={(e) => update("address", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>İlçe *</label>
                        <input required type="text" placeholder="Şişli" className={inputClass}
                          value={form.district} onChange={(e) => update("district", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Şehir *</label>
                        <input required type="text" className={inputClass}
                          value={form.city} onChange={(e) => update("city", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Teslimat Tarihi *</label>
                        <input required type="date" className={inputClass}
                          value={form.deliveryDate} onChange={(e) => update("deliveryDate", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Teslimat Saati *</label>
                        <select required className={inputClass}
                          value={form.deliveryTime} onChange={(e) => update("deliveryTime", e.target.value)}>
                          <option value="">Saat seçin</option>
                          <option value="09-12">09:00 – 12:00</option>
                          <option value="12-15">12:00 – 15:00</option>
                          <option value="15-18">15:00 – 18:00</option>
                          <option value="18-21">18:00 – 21:00</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#f0f0f0] rounded-sm p-6">
                  <h2 className="font-heading text-lg text-[#1d3435] font-medium mb-5">
                    Alıcı Bilgileri & Kart Mesajı
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Alıcı Adı *</label>
                        <input required type="text" placeholder="Teslim edilecek kişi" className={inputClass}
                          value={form.recipientName} onChange={(e) => update("recipientName", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Alıcı Telefonu *</label>
                        <input required type="tel" placeholder="0532 000 00 00" className={inputClass}
                          value={form.recipientPhone} onChange={(e) => update("recipientPhone", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Kart Mesajı</label>
                      <textarea rows={3} placeholder="Çiçeğe eklenecek kart mesajınız..." className={inputClass + " resize-none"}
                        value={form.cardMessage} onChange={(e) => update("cardMessage", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Sipariş Notu</label>
                      <textarea rows={2} placeholder="Floristimize özel notunuz..." className={inputClass + " resize-none"}
                        value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#f0f0f0] rounded-sm p-6">
                  <h2 className="font-heading text-lg text-[#1d3435] font-medium mb-5">
                    Ödeme Yöntemi
                  </h2>
                  <div className="space-y-3">
                    {[
                      { value: "kapida", label: "Kapıda Ödeme (Nakit / Kredi Kartı)" },
                      { value: "havale", label: "Banka Havalesi / EFT" },
                      { value: "online", label: "Online Kredi / Banka Kartı (Yakında)" },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="payment"
                          value={opt.value}
                          checked={form.paymentMethod === opt.value}
                          onChange={() => update("paymentMethod", opt.value)}
                          disabled={opt.value === "online"}
                          className="accent-[#3d7b74] w-4 h-4"
                        />
                        <span className={`text-[13px] ${opt.value === "online" ? "text-[#bbb]" : "text-[#545454] group-hover:text-[#1d3435]"} transition-colors`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sağ — sipariş özeti */}
              <div className="lg:col-span-1">
                <div className="bg-[#f9f8f6] rounded-sm p-6 sticky top-[90px]">
                  <h2 className="font-heading text-lg text-[#1d3435] font-medium mb-5">
                    Sipariş Özeti
                  </h2>

                  <div className="space-y-3 mb-4">
                    {items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-14 flex-shrink-0 rounded-sm overflow-hidden bg-[#f0ede9]">
                          <Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover" sizes="48px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-[#1d3435] font-medium truncate">{product.name}</p>
                          <p className="text-[11px] text-[#999]">× {quantity}</p>
                        </div>
                        <span className="text-[12px] font-semibold text-[#1d3435] flex-shrink-0">
                          ₺{((product.salePrice ?? product.price) * quantity).toLocaleString("tr-TR")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#e8e8e8] pt-4 space-y-2 text-[13px]">
                    <div className="flex justify-between text-[#545454]">
                      <span>Ara toplam</span>
                      <span>₺{total.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between text-[#545454]">
                      <span>Teslimat</span>
                      <span className={shipping === 0 ? "text-[#3d7b74] font-semibold" : ""}>
                        {shipping === 0 ? "Ücretsiz" : `₺${shipping}`}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#e8e8e8] mt-3 pt-3 flex justify-between">
                    <span className="font-semibold text-[#1d3435]">Toplam</span>
                    <span className="font-bold text-[18px] text-[#1d3435]">
                      ₺{grandTotal.toLocaleString("tr-TR")}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full mt-5 disabled:opacity-60"
                  >
                    {loading ? "Sipariş Oluşturuluyor..." : "Siparişi Onayla"}
                  </button>

                  <p className="text-[11px] text-[#999] text-center mt-3 leading-relaxed">
                    Siparişinizi onaylayarak{" "}
                    <Link href="/kullanim-kosullari" className="underline hover:text-[#1d3435]">
                      kullanım koşullarını
                    </Link>{" "}
                    kabul etmiş olursunuz.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
