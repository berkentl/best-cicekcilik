"use client";

import { useState, useEffect, useCallback } from "react";
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

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const sub = existing ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC,
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });
  } catch (err) {
    console.warn("[push] subscribe failed:", err);
  }
}

async function unsubscribeFromPush() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
  } catch (err) {
    console.warn("[push] unsubscribe failed:", err);
  }
}

export function AdminNotifications({ newOrderCount }: { newOrderCount: number }) {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && Boolean(VAPID_PUBLIC);
    setPushSupported(supported);
    if (supported) {
      const storedEnabled = localStorage.getItem("admin_push") === "1";
      setPushEnabled(storedEnabled);
      if (storedEnabled) {
        navigator.serviceWorker.register("/sw.js").then(subscribeToPush);
      }
    }
  }, []);

  const handlePushToggle = async () => {
    if (!pushEnabled) {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        alert("Bildirim izni verilmedi. Tarayıcı ayarlarından etkinleştirin.");
        return;
      }
      await navigator.serviceWorker.register("/sw.js");
      await subscribeToPush();
      localStorage.setItem("admin_push", "1");
      setPushEnabled(true);
    } else {
      await unsubscribeFromPush();
      localStorage.removeItem("admin_push");
      setPushEnabled(false);
    }
  };

  const dismissToast = useCallback((toastId: string) => {
    setToasts((p) => p.filter((t) => t.toastId !== toastId));
  }, []);

  const playSound = useCallback(() => {
    try { new Audio("/sounds/order.wav").play(); } catch {}
  }, []);

  const showToast = useCallback((order: NewOrder) => {
    const toastId = `toast-${order.id}`;
    setToasts((p) => {
      if (p.some((t) => t.toastId === toastId)) return p;
      return [...p, { ...order, toastId }];
    });
    setTimeout(() => dismissToast(toastId), 6000);
    playSound();
  }, [dismissToast, playSound]);

  /* Realtime subscription */
  useEffect(() => {
    const channel = supabase
      .channel("admin_new_orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        showToast(payload.new as NewOrder);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [showToast]);

  /* Polling fallback — 30sn'de bir yeni sipariş var mı kontrol et */
  useEffect(() => {
    const seenIds = new Set<string>();
    let initialized = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/orders/recent");
        if (!res.ok) return;
        const data = await res.json() as { orders?: NewOrder[] };
        const orders: NewOrder[] = data.orders ?? [];
        if (!initialized) {
          orders.forEach((o) => seenIds.add(o.id));
          initialized = true;
          return;
        }
        for (const order of orders) {
          if (!seenIds.has(order.id)) {
            seenIds.add(order.id);
            showToast(order);
          }
        }
      } catch {}
    };

    poll();
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, [showToast]);

  return (
    <>
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[100] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.toastId}
            className="pointer-events-auto bg-[#1d3435] text-white rounded-xl shadow-2xl px-5 py-4 min-w-[280px] max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom-3 fade-in duration-300">
            <div className="w-9 h-9 bg-[#3d7b74] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold">🌸 Yeni Sipariş!</p>
              <p className="text-[12px] text-white/70">{toast.customer_name}</p>
              <p className="text-[12px] font-semibold text-[#6dbfb8]">₺{toast.total_amount?.toLocaleString("tr-TR")}</p>
            </div>
            <button onClick={() => dismissToast(toast.toastId)} className="text-white/50 hover:text-white transition-colors mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2">
        {/* Bildirim Rozeti */}
        <div className="relative">
          <button onClick={() => setShowSettings((p) => !p)}
            className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors text-[#545454]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {newOrderCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {newOrderCount > 9 ? "9+" : newOrderCount}
              </span>
            )}
          </button>

          {showSettings && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
              <div className="absolute right-0 top-10 z-50 w-72 bg-white rounded-xl shadow-2xl border border-[#ebebeb] p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#999] mb-3">Bildirim Ayarları</p>

                <div className="flex items-center justify-between bg-[#f9f9f9] rounded-lg px-4 py-3 mb-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1d3435]">Arka Plan Bildirimi</p>
                    <p className="text-[11px] text-[#999]">{pushSupported ? "Tarayıcı push bildirimi" : "Cihaz ana ekrana eklenmeli"}</p>
                  </div>
                  {pushSupported ? (
                    <button onClick={handlePushToggle}
                      className={`relative w-11 h-6 rounded-full transition-colors ${pushEnabled ? "bg-[#3d7b74]" : "bg-[#e0e0e0]"}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${pushEnabled ? "left-6" : "left-1"}`} />
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#3d7b74] font-semibold">PWA</span>
                  )}
                </div>

                <div className="text-[11px] text-[#999] bg-[#f5f5f5] rounded-lg px-3 py-2.5 leading-relaxed">
                  Realtime bildirimler her zaman açık — yeni sipariş geldiğinde sağ altta toast mesajı gösterilir.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
