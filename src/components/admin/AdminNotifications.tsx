"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface NewOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
}

interface Toast extends NewOrder {
  toastId: string;
}

/* ── AudioContext (tarayıcı autoplay politikasını aşar) ──────────
   İlk kullanıcı etkileşiminde (tıklama/tuş) context açılır ve
   ses dosyası decode edilir. Sipariş geldiğinde buffer'dan oynatılır.
──────────────────────────────────────────────────────────────────── */
let _audioCtx: AudioContext | null = null;
let _audioBuffer: AudioBuffer | null = null;

function getOrCreateAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!_audioCtx) _audioCtx = new AC();
  return _audioCtx;
}

function unlockAudio() {
  const ctx = getOrCreateAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  if (_audioBuffer) return; // already loaded
  fetch("/sounds/order.wav")
    .then((r) => r.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => { _audioBuffer = decoded; })
    .catch(() => {});
}

function playOrderSound() {
  const ctx = _audioCtx;
  if (ctx && _audioBuffer) {
    const src = ctx.createBufferSource();
    src.buffer = _audioBuffer;
    src.connect(ctx.destination);
    src.start(0);
  } else {
    // AudioContext henüz unlock olmadıysa fallback
    try { new Audio("/sounds/order.wav").play().catch(() => {}); } catch {}
  }
}

/* ── Browser Notification ────────────────────────────────────────
   Notification API: sekme arka planda/minimizeyken bile çalışır.
   Push (SW) değil — sekme açıkken her cihazda anında tetiklenir.
──────────────────────────────────────────────────────────────────── */
function showBrowserNotification(order: NewOrder) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const n = new Notification("🌸 Yeni Sipariş!", {
      body: `${order.customer_name || "Müşteri"} — ₺${order.total_amount?.toLocaleString("tr-TR") ?? "?"}`,
      icon: "/seo/favicon-96x96.png",
      badge: "/seo/favicon-96x96.png",
      tag: `order-${order.id}`,
      requireInteraction: true, // bildirimi otomatik kapatma
    });
    n.onclick = () => {
      window.focus();
      window.location.href = "/admin/siparisler";
      n.close();
    };
  } catch {}
}

/* ── iOS Safari tespiti ──────────────────────────────────────────
   iOS Safari'de Notification API tarayıcıda çalışmaz.
   Sadece "Ana Ekrana Ekle" (PWA) modunda + iOS 16.4+ desteklenir.
──────────────────────────────────────────────────────────────────── */
function getEnv() {
  if (typeof window === "undefined") return { isIOS: false, isPWA: false, notifSupported: false };
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isPWA = (navigator as unknown as { standalone?: boolean }).standalone === true;
  const notifSupported = "Notification" in window;
  return { isIOS, isPWA, notifSupported };
}

/* ── Component ───────────────────────────────────────────────────── */
export function AdminNotifications({ newOrderCount }: { newOrderCount: number }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [env, setEnv] = useState({ isIOS: false, isPWA: false, notifSupported: false });

  useEffect(() => { startTransition(() => setEnv(getEnv())); }, []);

  /* İlk kullanıcı etkileşiminde AudioContext'i unlock et */
  useEffect(() => {
    const handler = () => unlockAudio();
    window.addEventListener("click", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  /* Sayfa yüklenince bildirim iznini kontrol et / otomatik iste */
  useEffect(() => {
    if (!("Notification" in window)) return;
    const perm = Notification.permission;
    startTransition(() => setNotifPermission(perm));
    if (perm === "default") {
      const t = setTimeout(() => {
        Notification.requestPermission().then((p) => setNotifPermission(p));
      }, 2000);
      return () => clearTimeout(t);
    }
  }, []);

  /* Okunmamış bildirim sayısı */
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/admin/notifications?unread=1");
        if (res.ok) {
          const data = (await res.json()) as unknown[];
          setUnreadCount(data.length);
        }
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((p) => p.filter((t) => t.toastId !== toastId));
  }, []);

  const handleNewOrder = useCallback(
    (order: NewOrder) => {
      // 1. In-page toast
      const toastId = `toast-${order.id}`;
      setToasts((p) => {
        if (p.some((t) => t.toastId === toastId)) return p;
        return [...p, { ...order, toastId }];
      });
      setTimeout(() => dismissToast(toastId), 8000);

      // 2. Ses
      playOrderSound();

      // 3. Tarayıcı bildirimi (arka planda bile çalışır)
      showBrowserNotification(order);
    },
    [dismissToast]
  );

  /* Supabase Realtime */
  useEffect(() => {
    const channel = supabase
      .channel("admin_new_orders_v2")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => handleNewOrder(payload.new as NewOrder)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [handleNewOrder]);

  /* Polling fallback (30 sn) */
  useEffect(() => {
    const seenIds = new Set<string>();
    let initialized = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/orders/recent");
        if (!res.ok) return;
        const data = (await res.json()) as { orders?: NewOrder[] };
        const orders: NewOrder[] = data.orders ?? [];
        if (!initialized) {
          orders.forEach((o) => seenIds.add(o.id));
          initialized = true;
          return;
        }
        for (const order of orders) {
          if (!seenIds.has(order.id)) {
            seenIds.add(order.id);
            handleNewOrder(order);
          }
        }
      } catch {}
    };

    poll();
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, [handleNewOrder]);

  const totalBadge = unreadCount + newOrderCount;

  return (
    <>
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[100] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.toastId}
            className="pointer-events-auto bg-[#1d3435] text-white rounded-xl shadow-2xl px-5 py-4 min-w-[280px] max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-3 fade-in duration-300"
          >
            <div className="w-9 h-9 bg-[#3d7b74] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold">🌸 Yeni Sipariş!</p>
              <p className="text-[12px] text-white/70 mt-0.5">{toast.customer_name}</p>
              <p className="text-[12px] font-semibold text-[#6dbfb8]">
                ₺{toast.total_amount?.toLocaleString("tr-TR")}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.toastId)}
              className="text-white/50 hover:text-white transition-colors mt-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Header Icon */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowSettings((p) => !p)}
            className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors text-[#545454]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {totalBadge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {totalBadge > 9 ? "9+" : totalBadge}
              </span>
            )}
          </button>

          {showSettings && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
              <div className="absolute right-0 top-10 z-50 w-72 bg-white rounded-xl shadow-2xl border border-[#ebebeb] p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#999] mb-3">
                  Bildirim Durumu
                </p>

                {/* iOS Safari — tarayıcıda Notification API desteklenmiyor */}
                {env.isIOS && !env.isPWA ? (
                  <div className="space-y-2 mb-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-3">
                      <p className="text-[12px] font-semibold text-amber-800 mb-1">iPhone&apos;da bildirim almak için:</p>
                      <ol className="text-[11px] text-amber-700 space-y-1 list-none">
                        <li>1. Safari&apos;de alttaki <strong>Paylaş</strong> butonuna bas <span className="text-[13px]">⬆</span></li>
                        <li>2. <strong>&quot;Ana Ekrana Ekle&quot;</strong> seç</li>
                        <li>3. Ana ekrandaki <strong>Dünyanın Çiçeği</strong> ikonundan aç</li>
                        <li>4. Bildirime izin ver — artık sipariş bildirimleri gelecek</li>
                      </ol>
                    </div>
                    <div className="text-[11px] text-[#999] bg-[#f5f5f5] rounded-lg px-3 py-2.5 leading-relaxed">
                      Şu an Safari tarayıcısındasınız. Apple, Safari&apos;de bildirimlere izin vermez — sadece ana ekrandan açılan uygulamalarda çalışır.
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Diğer tarayıcılar (Chrome, Firefox, PWA) */}
                    <div className="flex items-center justify-between bg-[#f9f9f9] rounded-lg px-4 py-3 mb-2">
                      <div>
                        <p className="text-[13px] font-semibold text-[#1d3435]">Tarayıcı Bildirimi</p>
                        <p className="text-[11px] text-[#999]">
                          {!env.notifSupported
                            ? "Bu tarayıcıda desteklenmiyor"
                            : notifPermission === "granted"
                            ? "Aktif — Arka planda bildirim alırsınız"
                            : notifPermission === "denied"
                            ? "Engellendi — Tarayıcı ayarlarından açın"
                            : "Henüz izin verilmedi"}
                        </p>
                      </div>
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          notifPermission === "granted"
                            ? "bg-green-500"
                            : notifPermission === "denied"
                            ? "bg-red-500"
                            : "bg-yellow-400"
                        }`}
                      />
                    </div>

                    {notifPermission === "denied" && (
                      <p className="text-[11px] text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-2 leading-relaxed">
                        Bildirimler engellenmiş. Adres çubuğundaki kilit ikonuna tıklayıp &quot;Bildirimler&quot; iznini açın.
                      </p>
                    )}

                    {env.notifSupported && notifPermission === "default" && (
                      <button
                        onClick={() =>
                          Notification.requestPermission().then((p) => setNotifPermission(p))
                        }
                        className="w-full py-2 mb-2 rounded-lg bg-[#3d7b74] text-white text-[12px] font-semibold hover:bg-[#2d6b64] transition-colors"
                      >
                        Bildirimlere İzin Ver
                      </button>
                    )}

                    <div className="text-[11px] text-[#999] bg-[#f5f5f5] rounded-lg px-3 py-2.5 leading-relaxed mb-3">
                      Yeni sipariş geldiğinde hem ses çalar hem de bildirim görünür. İzin verilirse sekme arka planda olsa bile uyarı alırsınız.
                    </div>
                  </>
                )}

                <Link
                  href="/admin/bildirimler"
                  onClick={() => setShowSettings(false)}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-[#ebebeb] text-[12px] font-semibold text-[#1d3435] hover:bg-[#f5f5f5] transition-colors"
                >
                  Tüm Bildirimleri Gör
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
