"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthInput } from "@/components/auth/AuthInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth";
import { formatPhoneInput } from "@/lib/phone";

function KayitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/hesabim";
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { kvkkConsent: false, marketingConsent: false },
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? "Hesap oluşturulamadı.");
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
      title="Hesap Oluştur"
      subtitle="Best Çiçekçilik ailesine katılın, siparişlerinizi tek yerden takip edin."
      footer={
        <>
          Zaten hesabınız var mı?{" "}
          <Link href={`/giris?next=${encodeURIComponent(next)}`} className="font-semibold text-[#1d3435] hover:text-[#3d7b74] transition-colors">
            Giriş Yap
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput label="Ad Soyad" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <AuthInput label="E-posta" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <AuthInput
              label="Telefon (opsiyonel)"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="05XX XXX XX XX"
              maxLength={14}
              error={errors.phone?.message}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />
        <AuthInput label="Şifre" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <AuthInput label="Şifre (Tekrar)" type="password" autoComplete="new-password" error={errors.passwordConfirm?.message} {...register("passwordConfirm")} />

        <div className="space-y-2.5 pt-1">
          <Controller
            control={control}
            name="kvkkConsent"
            render={({ field }) => (
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#e2ddd8] text-[#3d7b74] focus:ring-[#3d7b74]/20"
                />
                <span className="text-[12.5px] text-[#666] leading-relaxed">
                  <Link href="/kvkk" className="underline text-[#1d3435] hover:text-[#3d7b74]">
                    KVKK Aydınlatma Metni
                  </Link>
                  &apos;ni okudum ve kabul ediyorum. *
                </span>
              </label>
            )}
          />
          {errors.kvkkConsent && (
            <p className="text-[12px] text-red-600 ml-6">{errors.kvkkConsent.message}</p>
          )}

          <Controller
            control={control}
            name="marketingConsent"
            render={({ field }) => (
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#e2ddd8] text-[#3d7b74] focus:ring-[#3d7b74]/20"
                />
                <span className="text-[12.5px] text-[#666] leading-relaxed">
                  Kampanya ve fırsatlardan e-posta ile haberdar olmak istiyorum.
                </span>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2.5 bg-[#1d3435] hover:bg-[#243f40] active:bg-[#162828] text-white font-semibold text-[14px] tracking-wide py-3.5 rounded-xl transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Hesap oluşturuluyor..." : "Üye Ol"}
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

export function KayitClient() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] bg-[#faf8f5]" />}>
      <KayitForm />
    </Suspense>
  );
}
