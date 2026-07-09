"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function GoogleButton({ next = "/hesabim" }: { next?: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    // Supabase burada tarayıcıyı Google'a yönlendirir; setLoading(false)'a gerek yok.
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 border border-[#e2ddd8] rounded-xl py-3 text-[13px] font-semibold text-[#1d3435] bg-white hover:bg-[#faf8f5] hover:border-[#d5cec6] transition-all duration-150 disabled:opacity-60"
    >
      <svg width="17" height="17" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.97h3.86c2.26-2.09 3.56-5.17 3.56-8.79z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.97c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.24v3.09C3.26 21.3 7.31 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.31A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.37-2.31V6.6H1.24A11.93 11.93 0 0 0 0 12c0 1.93.46 3.76 1.24 5.4l4.03-3.09z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.24 6.6l4.03 3.09C6.22 6.86 8.87 4.75 12 4.75z"
        />
      </svg>
      {loading ? "Yönlendiriliyor..." : "Google ile devam et"}
    </button>
  );
}
