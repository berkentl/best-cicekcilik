"use client";

/**
 * Footer'daki "Çerez Tercihleri" bağlantısı.
 *
 * KVKK bakımından geri almanın verme kadar kolay olması gerekir; bu
 * bağlantı, çerez onay bandını her zaman yeniden açılabilir kılar.
 * Footer bir sunucu bileşeni olduğu için olay tetikleme buraya ayrıldı.
 */
export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("cerez-tercihleri-ac"))}
      className={className}
    >
      Çerez Tercihleri
    </button>
  );
}
