"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, XIcon } from "@/components/icons";
import { AuthInput } from "@/components/auth/AuthInput";
import { addressSchema, type AddressFormValues } from "@/lib/schemas/auth";
import { formatPhoneInput } from "@/lib/phone";
import type { Address } from "@/types";

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data: Address[]) => setAddresses(data))
      .catch(() => setAddresses([]));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (addr: Address) => {
    setEditing(addr);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    setConfirmingId(null);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-poppins text-2xl font-semibold text-[#1d3435]">Adreslerim</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1d3435] hover:bg-[#243f40] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <PlusIcon size={15} /> Yeni Adres
        </button>
      </div>

      {addresses === null ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-white border border-[#ede8e3] animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ede8e3] text-center py-16 px-6">
          <MapPinIcon size={40} className="text-[#e2ddd8] mx-auto mb-4" />
          <p className="text-[#8a9c9c] text-[14px] mb-5">Henüz kayıtlı bir adresiniz yok.</p>
          <button onClick={openCreate} className="btn-primary">
            İlk Adresini Ekle
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl border border-[#ede8e3] p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-[#1d3435]">{addr.title}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-[#f5f9f8] text-[#3d7b74] px-2 py-0.5 rounded-full">
                      Varsayılan
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(addr)}
                    className="p-1.5 text-[#8a9c9c] hover:text-[#1d3435] transition-colors"
                    aria-label="Düzenle"
                  >
                    <PencilIcon size={15} />
                  </button>
                  <button
                    onClick={() => setConfirmingId(addr.id)}
                    className="p-1.5 text-[#8a9c9c] hover:text-red-500 transition-colors"
                    aria-label="Sil"
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              </div>
              <p className="text-[13px] font-medium text-[#1d3435] mb-0.5">{addr.recipientName}</p>
              <p className="text-[12.5px] text-[#8a9c9c] mb-2">{addr.recipientPhone}</p>
              <p className="text-[13px] text-[#545454] leading-relaxed flex-1">
                {addr.fullAddress}, {addr.district} / {addr.city}
              </p>

              <AnimatePresence>
                {confirmingId === addr.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-[#f0ebe6] flex items-center justify-between gap-3">
                      <p className="text-[12.5px] text-[#b0685f]">Bu adresi silmek istediğinize emin misiniz?</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="text-[12px] font-semibold text-[#8a9c9c] hover:text-[#1d3435]"
                        >
                          Vazgeç
                        </button>
                        <button
                          onClick={() => handleDelete(addr.id)}
                          className="text-[12px] font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          load();
        }}
        initial={editing}
      />
    </div>
  );
}

function AddressModal({
  open,
  onClose,
  onSaved,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial: Address | null;
}) {
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema) });

  useEffect(() => {
    if (open) {
      setServerError("");
      reset(
        initial
          ? {
              title: initial.title,
              recipientName: initial.recipientName,
              recipientPhone: initial.recipientPhone,
              city: initial.city,
              district: initial.district,
              fullAddress: initial.fullAddress,
              isDefault: initial.isDefault,
            }
          : { title: "", recipientName: "", recipientPhone: "", city: "", district: "", fullAddress: "", isDefault: false }
      );
    }
  }, [open, initial, reset]);

  const onSubmit: SubmitHandler<AddressFormValues> = async (values) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch(initial ? `/api/addresses/${initial.id}` : "/api/addresses", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? "Adres kaydedilemedi.");
      }
      onSaved();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[950] bg-black/40 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 md:p-7"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-poppins text-xl font-semibold text-[#1d3435]">
                {initial ? "Adresi Düzenle" : "Yeni Adres"}
              </h2>
              <button onClick={onClose} className="text-[#8a9c9c] hover:text-[#1d3435] transition-colors">
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <AuthInput label="Adres Başlığı" placeholder="Ev, Ofis..." error={errors.title?.message} {...register("title")} />
              <div className="grid grid-cols-2 gap-3">
                <AuthInput label="Alıcı Adı Soyadı" error={errors.recipientName?.message} {...register("recipientName")} />
                <Controller
                  control={control}
                  name="recipientPhone"
                  render={({ field }) => (
                    <AuthInput
                      label="Telefon"
                      type="tel"
                      inputMode="numeric"
                      placeholder="0532 000 00 00"
                      maxLength={14}
                      error={errors.recipientPhone?.message}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AuthInput label="Şehir" error={errors.city?.message} {...register("city")} />
                <AuthInput label="İlçe" error={errors.district?.message} {...register("district")} />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a7070] mb-1.5">
                  Açık Adres
                </label>
                <textarea
                  rows={3}
                  {...register("fullAddress")}
                  className={`w-full border rounded-xl px-4 py-3 text-[14px] text-[#1d3435] placeholder:text-[#c0b8b0] bg-white transition-all duration-200 focus:outline-none resize-none ${
                    errors.fullAddress
                      ? "border-red-300 focus:border-red-400"
                      : "border-[#e2ddd8] focus:border-[#3d7b74] focus:shadow-[0_0_0_4px_rgba(61,123,116,0.12)]"
                  }`}
                />
                {errors.fullAddress && <p className="mt-1.5 text-[12px] text-red-600">{errors.fullAddress.message}</p>}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  {...register("isDefault")}
                  className="w-4 h-4 rounded border-[#e2ddd8] text-[#3d7b74] focus:ring-[#3d7b74]/20"
                />
                <span className="text-[13px] text-[#545454]">Varsayılan adresim olsun</span>
              </label>

              <AnimatePresence>
                {serverError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5"
                  >
                    {serverError}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 bg-[#1d3435] hover:bg-[#243f40] text-white font-semibold text-[14px] py-3.5 rounded-xl transition-all duration-150 disabled:opacity-60"
              >
                {loading ? "Kaydediliyor..." : initial ? "Değişiklikleri Kaydet" : "Adresi Kaydet"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
