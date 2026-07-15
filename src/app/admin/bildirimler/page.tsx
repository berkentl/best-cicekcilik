"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "new_order" | "out_of_stock" | "order_approved" | "order_rejected";
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az önce";
  if (mins < 60) return `${mins} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === "new_order") {
    return (
      <div className="w-10 h-10 rounded-full bg-[#3d7b74]/15 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-[#3d7b74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
    );
  }
  if (type === "order_approved") {
    return (
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75l2.25 2.25L15 9m6 3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  if (type === "order_rejected") {
    return (
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
  );
}

export default function BildirimlerPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "new_order" | "out_of_stock" | "order_approved" | "order_rejected">("all");

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/admin/notifications");
    if (res.ok) setNotifications(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { startTransition(() => { fetchNotifications(); }); }, [fetchNotifications]);

  // iOS/Android'de ana ekrandan eklenen uygulama arka plandan/askıya
  // alınmış durumdan döndüğünde listeyi tazele.
  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("pageshow", handleVisible);
    return () => {
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("pageshow", handleVisible);
    };
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/admin/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await fetch("/api/admin/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) });
    setNotifications((p) => p.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const clearRead = async () => {
    await fetch("/api/admin/notifications", { method: "DELETE" });
    setNotifications((p) => p.filter((n) => !n.is_read));
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "all") return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-[20px] font-medium text-[#1d3435]">Bildirimler</h1>
          {unreadCount > 0 && (
            <p className="text-[12px] text-[#999] mt-0.5">{unreadCount} okunmamış bildirim</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="text-[12px] font-semibold text-[#3d7b74] hover:text-[#1d3435] transition-colors">
              Tümünü Okundu İşaretle
            </button>
          )}
          <button onClick={clearRead}
            className="text-[12px] text-[#bbb] hover:text-red-400 transition-colors ml-2">
            Okunanları Temizle
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {([
          { key: "all", label: "Tümü" },
          { key: "unread", label: "Okunmamış" },
          { key: "new_order", label: "Siparişler" },
          { key: "order_approved", label: "Onaylar" },
          { key: "order_rejected", label: "Revize Talepleri" },
          { key: "out_of_stock", label: "Stok Tükendi" },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              filter === key
                ? "bg-[#1d3435] text-white"
                : "bg-white border border-[#ebebeb] text-[#666] hover:border-[#1d3435] hover:text-[#1d3435]"
            }`}>
            {label}
            {key === "all" && notifications.length > 0 && (
              <span className="ml-1.5 opacity-60">{notifications.length}</span>
            )}
            {key === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#ebebeb] p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0f0f0]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#f0f0f0] rounded w-1/3" />
                  <div className="h-3 bg-[#f0f0f0] rounded w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#ebebeb]">
            <div className="w-14 h-14 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-[13px] text-[#999]">Gösterilecek bildirim yok</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div key={notif.id}
              onClick={() => { if (!notif.is_read) markRead(notif.id); }}
              className={`flex items-start gap-3 bg-white rounded-xl border px-4 py-3.5 cursor-pointer transition-all hover:shadow-sm ${
                notif.is_read ? "border-[#ebebeb] opacity-70" : "border-[#3d7b74]/30 bg-[#f8fdfc]"
              }`}>
              <NotifIcon type={notif.type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[13px] leading-snug ${notif.is_read ? "text-[#666]" : "text-[#1d3435] font-semibold"}`}>
                    {notif.title}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-[#bbb] whitespace-nowrap">{timeAgo(notif.created_at)}</span>
                    {!notif.is_read && <span className="w-2 h-2 rounded-full bg-[#3d7b74] flex-shrink-0" />}
                  </div>
                </div>
                <p className="text-[12px] text-[#888] mt-0.5 leading-relaxed">{notif.message}</p>
                {(notif.type === "new_order" || notif.type === "order_approved" || notif.type === "order_rejected") && (
                  <Link href="/admin/siparisler"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block mt-1.5 text-[11px] text-[#3d7b74] font-semibold hover:underline">
                    Siparişlere Git →
                  </Link>
                )}
                {notif.type === "out_of_stock" && (
                  <Link href="/admin/urunler"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block mt-1.5 text-[11px] text-orange-500 font-semibold hover:underline">
                    Ürünlere Git →
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
