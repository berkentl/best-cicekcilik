"use client";

import { useCallback, useState } from "react";
import Script from "next/script";
import { PAYTR_IFRAME_BASE } from "@/lib/paytr";

declare global {
  interface Window {
    iFrameResize?: (options: Record<string, unknown>, target: string) => void;
  }
}

const FRAME_ID = "paytriframe";

/**
 * PayTR'nin güvenli ödeme formunu gösterir.
 *
 * Form PayTR'nin alan adında açılır; kart numarası, CVV ve 3D Secure adımı
 * hiçbir zaman bu sitenin sunucusundan geçmez.
 *
 * iframeResizer, PayTR'nin CDN'inden yüklenir ve iframe yüksekliğini içeriğe
 * göre ayarlar. Bu olmadan taksit/3D ekranları arasında geçişte form kesiliyor
 * veya iframe içinde ikinci bir kaydırma çubuğu oluşuyor — mobilde ödemeyi
 * tamamlamayı fiilen imkânsız hâle getiriyor.
 */
export function PaytrCheckoutFrame({ token }: { token: string }) {
  const [scriptFailed, setScriptFailed] = useState(false);

  const resize = useCallback(() => {
    window.iFrameResize?.({ checkOrigin: false }, `#${FRAME_ID}`);
  }, []);

  return (
    <>
      <iframe
        id={FRAME_ID}
        src={`${PAYTR_IFRAME_BASE}/${token}`}
        title="PayTR Güvenli Ödeme Formu"
        // Betik yüklenmezse yükseklik ayarlanamaz; sabit bir taban yükseklik
        // veriliyor ki form yine de kullanılabilir kalsın.
        className="w-full border-0"
        style={{ minHeight: scriptFailed ? 720 : 520 }}
        scrolling={scriptFailed ? "yes" : "no"}
      />
      <Script
        src="https://www.paytr.com/js/iframeResizer.min.js"
        strategy="afterInteractive"
        onLoad={resize}
        onError={() => setScriptFailed(true)}
      />
    </>
  );
}
