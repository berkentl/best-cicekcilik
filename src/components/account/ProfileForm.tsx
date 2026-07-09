"use client";

import { useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { AuthInput } from "@/components/auth/AuthInput";
import { CheckCircleIcon } from "@/components/icons";
import { formatPhoneInput } from "@/lib/phone";
import {
  profileSchema,
  changePasswordSchema,
  type ProfileFormValues,
  type ChangePasswordFormValues,
} from "@/lib/schemas/auth";
import type { CustomerUser } from "@/types";

function SavedBadge({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3d7b74]"
        >
          <CheckCircleIcon size={15} /> Kaydedildi
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function ProfileForm({ user }: { user: CustomerUser }) {
  return (
    <div className="space-y-8 max-w-xl">
      <h1 className="font-poppins text-2xl font-semibold text-[#1d3435]">Hesap Bilgilerim</h1>
      <ProfileSection user={user} />
      <PasswordSection />
    </div>
  );
}

function ProfileSection({ user }: { user: CustomerUser }) {
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
      kvkkConsent: user.kvkkConsent ?? false,
      marketingConsent: user.marketingConsent ?? false,
    },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
    setServerError("");
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? "Profil güncellenemedi.");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ede8e3] p-6 md:p-7">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a9c9c] mb-4">
        Kişisel Bilgiler
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput label="Ad Soyad" error={errors.name?.message} {...register("name")} />
        <AuthInput label="E-posta" value={user.email} readOnly disabled className="opacity-60 cursor-not-allowed" />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <AuthInput
              label="Telefon"
              type="tel"
              inputMode="numeric"
              placeholder="05XX XXX XX XX"
              maxLength={14}
              error={errors.phone?.message}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />

        <div className="space-y-2.5 pt-1">
          <Controller
            control={control}
            name="kvkkConsent"
            render={({ field }) => (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 rounded border-[#e2ddd8] text-[#3d7b74] focus:ring-[#3d7b74]/20"
                />
                <span className="text-[13px] text-[#545454]">KVKK Aydınlatma Metni&apos;ni onaylıyorum</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="marketingConsent"
            render={({ field }) => (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 rounded border-[#e2ddd8] text-[#3d7b74] focus:ring-[#3d7b74]/20"
                />
                <span className="text-[13px] text-[#545454]">Kampanya ve fırsatlardan haberdar olmak istiyorum</span>
              </label>
            )}
          />
        </div>

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

        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1d3435] hover:bg-[#243f40] text-white font-semibold text-[13.5px] px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
          <SavedBadge show={saved} />
        </div>
      </form>
    </div>
  );
}

function PasswordSection() {
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async (values) => {
    setServerError("");
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? "Şifre güncellenemedi.");
      }
      setSaved(true);
      reset();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ede8e3] p-6 md:p-7">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a9c9c] mb-4">
        Şifre Değiştir
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label="Mevcut Şifre"
          type="password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <AuthInput
            label="Yeni Şifre"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <AuthInput
            label="Yeni Şifre (Tekrar)"
            type="password"
            autoComplete="new-password"
            error={errors.newPasswordConfirm?.message}
            {...register("newPasswordConfirm")}
          />
        </div>

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

        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1d3435] hover:bg-[#243f40] text-white font-semibold text-[13.5px] px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
          <SavedBadge show={saved} />
        </div>
      </form>
    </div>
  );
}
