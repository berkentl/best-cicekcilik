"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthInput } from "@/components/auth/AuthInput";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/schemas/auth";

function SifreSifirlaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  if (!token) {
    return (
      <AuthShell title="Bağlantı Geçersiz">
        <div className="text-center py-2">
          <p className="text-[13px] text-[#8a9c9c] mb-5 leading-relaxed">
            Şifre sıfırlama bağlantısı eksik veya geçersiz. Lütfen yeniden talep edin.
          </p>
          <Link href="/sifremi-unuttum" className="text-[13px] font-semibold text-[#3d7b74] hover:underline">
            Yeniden talep et
          </Link>
        </div>
      </AuthShell>
    );
  }

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (values) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? "Şifre sıfırlanamadı.");
      }
      router.push("/hesabim");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Yeni Şifre Belirle" subtitle="Hesabınız için yeni bir şifre oluşturun.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("token")} />
        <AuthInput label="Yeni Şifre" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <AuthInput label="Yeni Şifre (Tekrar)" type="password" autoComplete="new-password" error={errors.passwordConfirm?.message} {...register("passwordConfirm")} />

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
          {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </AuthShell>
  );
}

export function SifreSifirlaClient() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] bg-[#faf8f5]" />}>
      <SifreSifirlaForm />
    </Suspense>
  );
}
