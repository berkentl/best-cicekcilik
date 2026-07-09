"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthInput } from "@/components/auth/AuthInput";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/schemas/auth";

export function SifremiUnuttumClient() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (values) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? "Bir hata oluştu.");
      }
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Şifremi Unuttum"
      subtitle="Kayıtlı e-posta adresinizi girin, sıfırlama bağlantısını gönderelim."
      footer={
        <Link href="/giris" className="font-semibold text-[#1d3435] hover:text-[#3d7b74] transition-colors">
          Giriş sayfasına dön
        </Link>
      }
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <div className="w-14 h-14 rounded-full bg-[#f5f9f8] flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#3d7b74" strokeWidth="1.8" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[14px] text-[#1d3435] font-medium mb-1">Bağlantı gönderildi</p>
            <p className="text-[13px] text-[#8a9c9c] leading-relaxed">
              Bu e-posta sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <AuthInput label="E-posta" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />

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
              className="w-full mt-2 flex items-center justify-center gap-2.5 bg-[#1d3435] hover:bg-[#243f40] active:bg-[#162828] text-white font-semibold text-[14px] tracking-wide py-3.5 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
