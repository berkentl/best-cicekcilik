"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthInput } from "@/components/auth/AuthInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth";

function GirisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/hesabim";
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? "Giriş yapılamadı.");
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Hoş Geldiniz"
      subtitle="Hesabınıza giriş yaparak siparişlerinizi yönetin."
      footer={
        <>
          Henüz hesabınız yok mu?{" "}
          <Link href={`/kayit?next=${encodeURIComponent(next)}`} className="font-semibold text-[#1d3435] hover:text-[#3d7b74] transition-colors">
            Üye Ol
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          label="E-posta"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <AuthInput
            label="Şifre"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="text-right mt-1.5">
            <Link href="/sifremi-unuttum" className="text-[12px] text-[#8a9c9c] hover:text-[#3d7b74] transition-colors">
              Şifremi unuttum
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2.5 bg-[#1d3435] hover:bg-[#243f40] active:bg-[#162828] text-white font-semibold text-[14px] tracking-wide py-3.5 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-[#ede8e3]" />
          <span className="text-[11px] uppercase tracking-wider text-[#c0b8b0]">veya</span>
          <span className="h-px flex-1 bg-[#ede8e3]" />
        </div>

        <GoogleButton next={next} />
      </form>
    </AuthShell>
  );
}

export function GirisClient() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] bg-[#faf8f5]" />}>
      <GirisForm />
    </Suspense>
  );
}
