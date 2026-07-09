"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function OAuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get("next") || "/hesabim";

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setErrorMsg("Google oturumu alınamadı. Lütfen tekrar deneyin.");
        return;
      }

      try {
        const res = await fetch("/api/auth/oauth-callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: data.session.access_token }),
        });
        if (!res.ok) {
          const e = await res.json();
          setErrorMsg(e.error ?? "Giriş tamamlanamadı.");
          return;
        }
        // Supabase Auth tarayıcı oturumuna artık ihtiyacımız yok — kendi
        // customer_session cookie'miz set edildi.
        await supabase.auth.signOut();
        router.replace(next);
      } catch {
        setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
      }
    })();
  }, [router, searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#faf8f5] px-4">
      <div className="text-center">
        {errorMsg ? (
          <>
            <p className="text-[14px] text-red-600 mb-4">{errorMsg}</p>
            <Link href="/giris" className="text-[13px] font-semibold text-[#3d7b74] hover:underline">
              Giriş sayfasına dön
            </Link>
          </>
        ) : (
          <>
            <svg className="animate-spin w-7 h-7 text-[#3d7b74] mx-auto mb-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <p className="text-[13px] text-[#8a9c9c]">Giriş yapılıyor...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-[#faf8f5]" />
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
