"use client";

import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-[#f0f9f6] border border-[#3d7b74]/30 rounded-sm p-8 text-center">
        <svg
          className="w-12 h-12 text-[#3d7b74] mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="font-heading text-lg text-[#1d3435] font-medium mb-2">
          Mesajınız Alındı
        </h3>
        <p className="text-[13px] text-[#545454]">
          En kısa sürede size geri dönüş yapacağız.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ name: "", phone: "", email: "", subject: "", message: "" });
          }}
          className="mt-5 text-[12px] text-[#3d7b74] hover:text-[#1d3435] underline transition-colors"
        >
          Yeni mesaj gönder
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full border border-[#e8e8e8] rounded-sm px-4 py-2.5 text-[13px] text-[#1d3435] placeholder:text-[#bbb] focus:outline-none focus:border-[#3d7b74] transition-colors bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1.5">
            Ad Soyad *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Adınız Soyadınız"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1.5">
            Telefon
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0532 000 00 00"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1.5">
          E-posta *
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="ornek@mail.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1.5">
          Konu
        </label>
        <select
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className={inputClass}
        >
          <option value="">Konu seçin</option>
          <option value="siparis">Sipariş Bilgisi</option>
          <option value="teslimat">Teslimat</option>
          <option value="ozel-tasarim">Özel Tasarım</option>
          <option value="kurumsal">Kurumsal Sipariş</option>
          <option value="diger">Diğer</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#1d3435] mb-1.5">
          Mesaj *
        </label>
        <textarea
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Mesajınızı buraya yazın..."
          rows={5}
          className={inputClass + " resize-none"}
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Mesaj Gönder
      </button>
    </form>
  );
}
