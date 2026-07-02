"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { supabase } from "@/lib/supabase";

type OrderStatus = "Yeni" | "Hazırlanıyor" | "Kargoya Verildi" | "Teslim Edildi" | "İptal" | "İade";

interface OrderItem { name: string; qty: number; price: number }
interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  email: string;
  address: string;
  created_at: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  notes?: string;
  tracking_number?: string;
  delivery_date?: string;
  delivery_time?: string;
  recipient_name?: string;
  recipient_phone?: string;
  card_message?: string;
  payment_method?: string;
  subtotal?: number;
  discount_amount?: number;
  coupon_code?: string;
  shipping_fee?: number;
  kapida_fee?: number;
}

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  "Yeni":            { color: "text-blue-700",   bg: "bg-blue-100",   label: "Yeni" },
  "Hazırlanıyor":    { color: "text-yellow-700", bg: "bg-yellow-100", label: "Hazırlanıyor" },
  "Kargoya Verildi": { color: "text-purple-700", bg: "bg-purple-100", label: "Kargoya Verildi" },
  "Teslim Edildi":   { color: "text-green-700",  bg: "bg-green-100",  label: "Teslim Edildi" },
  "İptal":           { color: "text-red-700",    bg: "bg-red-100",    label: "İptal" },
  "İade":            { color: "text-orange-700", bg: "bg-orange-100", label: "İade" },
};

const SELECTABLE_STATUSES: OrderStatus[] = ["Yeni", "Hazırlanıyor", "Kargoya Verildi", "Teslim Edildi", "İptal", "İade"];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { bg: "bg-gray-100", color: "text-gray-600", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a09890]">{label}</p>
      <p className={`text-[13px] font-semibold text-[#1d3435] leading-snug ${mono ? "font-mono tracking-wide" : ""}`}>{value}</p>
    </div>
  );
}

function OrderDetailModal({ order, onClose, onUpdated }: {
  order: Order;
  onClose: () => void;
  onUpdated: (updated: Order) => void;
}) {
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [saving, setSaving] = useState(false);
  const [trackingSaved, setTrackingSaved] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) onUpdated(await res.json());
    setSaving(false);
  };

  const handleSaveTracking = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracking_number: tracking }),
    });
    if (res.ok) {
      onUpdated(await res.json());
      setTrackingSaved(true);
      setTimeout(() => setTrackingSaved(false), 2000);
    }
    setSaving(false);
  };

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const cfg = STATUS_CONFIG[order.status] ?? { bg: "bg-gray-100", color: "text-gray-700", label: order.status };

  const paymentLabel: Record<string, string> = {
    kapida: "Kapıda Ödeme",
    havale: "Banka Havalesi / EFT",
    online: "Online Kart",
  };

  const handlePrint = () => {
    const itemRows = items.map((item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ebe5;font-size:13px;color:#1d3435;font-weight:600;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ebe5;font-size:13px;color:#545454;text-align:center;">${item.qty}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ebe5;font-size:13px;color:#545454;text-align:right;">₺${item.price?.toLocaleString("tr-TR")}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0ebe5;font-size:13px;color:#1d3435;font-weight:700;text-align:right;">₺${((item.qty ?? 1) * (item.price ?? 0)).toLocaleString("tr-TR")}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html lang="tr"><head>
      <meta charset="UTF-8">
      <title>Sipariş ${order.order_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1d3435; background: #fff; padding: 32px; font-size: 13px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #1d3435; }
        .brand { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #3d7b74; margin-bottom: 4px; }
        .order-no { font-size: 20px; font-weight: 800; color: #1d3435; }
        .order-date { font-size: 11px; color: #a09890; margin-top: 3px; }
        .meta { text-align: right; }
        .meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a09890; }
        .meta-value { font-size: 13px; font-weight: 700; color: #1d3435; margin-top: 2px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .card { background: #faf8f6; border-radius: 10px; padding: 16px; }
        .card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #a09890; margin-bottom: 12px; }
        .field { margin-bottom: 10px; }
        .field-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a09890; margin-bottom: 2px; }
        .field-value { font-size: 13px; font-weight: 600; color: #1d3435; line-height: 1.4; }
        .delivery-card { background: #eef6f5; border: 1px solid #c8e6e1; border-radius: 10px; padding: 14px; margin-top: 12px; }
        .delivery-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #4a8a82; margin-bottom: 10px; }
        .delivery-time { font-size: 15px; font-weight: 800; color: #1d3435; }
        .delivery-time span { color: #3d7b74; }
        .msg-box { background: #fdf8f2; border: 1px solid #e8ddd0; border-radius: 10px; padding: 14px; margin-bottom: 20px; }
        .msg-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #c4956a; margin-bottom: 6px; }
        .msg-text { font-size: 13px; color: #6e5c44; }
        .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #a09890; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; border: 1px solid #ede8e3; border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
        thead tr { background: #faf8f6; }
        th { padding: 9px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a09890; border-bottom: 1px solid #ede8e3; }
        th:not(:first-child) { text-align: right; }
        th:nth-child(2) { text-align: center; }
        tfoot td { padding: 10px 12px; font-weight: 800; font-size: 15px; text-align: right; background: #faf8f6; border-top: 1px solid #ede8e3; }
        tfoot td:first-child { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6e6560; }
        .notes-box { border: 1px solid #e2ddd8; border-radius: 10px; padding: 14px; }
        .notes-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a09890; margin-bottom: 6px; }
        .notes-text { font-size: 13px; color: #545454; line-height: 1.5; }
        .tracking-box { background: #faf8f6; border-radius: 10px; padding: 14px; margin-bottom: 20px; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ede8e3; display: flex; justify-content: space-between; font-size: 11px; color: #a09890; }
        @media print { body { padding: 20px; } @page { margin: 1cm; } }
      </style>
    </head><body>
      <div class="header">
        <div>
          <div class="brand">Best Çiçekçilik & Organizasyon</div>
          <div class="order-no">${order.order_number}</div>
          <div class="order-date">${formatDate(order.created_at)}</div>
        </div>
        <div class="meta">
          ${order.delivery_date ? `<div class="meta-label">Teslimat</div><div class="meta-value">${order.delivery_date}</div>` : ""}
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="card-title">Sipariş Veren</div>
          <div class="field"><div class="field-label">Ad Soyad</div><div class="field-value">${order.customer_name}</div></div>
          <div class="field"><div class="field-label">Telefon</div><div class="field-value">${order.customer_phone}</div></div>
          <div class="field"><div class="field-label">E-posta</div><div class="field-value">${order.email}</div></div>
          ${order.payment_method ? `<div class="field"><div class="field-label">Ödeme</div><div class="field-value">${paymentLabel[order.payment_method] ?? order.payment_method}</div></div>` : ""}
        </div>
        <div>
          <div class="card">
            <div class="card-title">Alıcı</div>
            ${order.recipient_name ? `<div class="field"><div class="field-label">Ad Soyad</div><div class="field-value">${order.recipient_name}</div></div>` : ""}
            ${order.recipient_phone ? `<div class="field"><div class="field-label">Telefon</div><div class="field-value">${order.recipient_phone}</div></div>` : ""}
          </div>
          <div class="delivery-card">
            <div class="delivery-title">Teslimat</div>
            ${order.delivery_date ? `<div class="delivery-time">${order.delivery_date}${order.delivery_time ? ` <span>· ${order.delivery_time.replace("-", ":00 – ")}:00</span>` : ""}</div>` : ""}
            <div style="margin-top:8px;"><div class="field-label" style="color:#4a8a82;">Adres</div><div class="field-value" style="margin-top:2px;">${order.address}</div></div>
          </div>
        </div>
      </div>

      ${order.card_message ? `<div class="msg-box"><div class="msg-label">Kart Mesajı</div><div class="msg-text">"${order.card_message}"</div></div>` : ""}

      <div class="section-label">Sipariş İçeriği</div>
      <table>
        <thead><tr>
          <th style="text-align:left;">Ürün</th>
          <th style="text-align:center;">Adet</th>
          <th style="text-align:right;">Birim</th>
          <th style="text-align:right;">Toplam</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
        <tfoot><tr>
          <td colspan="3">Genel Toplam</td>
          <td>₺${order.total_amount?.toLocaleString("tr-TR")}</td>
        </tr></tfoot>
      </table>

      ${order.tracking_number ? `<div class="tracking-box"><div class="field-label">Kargo Takip No</div><div class="field-value" style="margin-top:4px;font-family:monospace;letter-spacing:0.05em;">${order.tracking_number}</div></div>` : ""}
      ${order.notes ? `<div class="notes-box"><div class="notes-label">Müşteri Notu</div><div class="notes-text">${order.notes}</div></div>` : ""}

      <div class="footer">
        <span>bestcicekcilik.com · 0532 295 93 09</span>
        <span>Yazdırma tarihi: ${new Date().toLocaleDateString("tr-TR")}</span>
      </div>
    </body></html>`;

    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-[#f0ebe5] flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a09890] mb-1">Sipariş</p>
            <h2 className="font-sans text-[18px] font-bold text-[#1d3435] tracking-tight leading-none">
              {order.order_number}
            </h2>
            <p className="text-[12px] text-[#b0a89e] mt-1">{formatDate(order.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#b0a89e] hover:bg-[#f5f0eb] hover:text-[#1d3435] transition-all flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Status Bar ── */}
        <div className="px-6 py-3 bg-[#faf8f6] border-b border-[#f0ebe5] flex items-center gap-3 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {cfg.label}
          </span>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            disabled={saving}
            className="ml-auto text-[12px] font-semibold text-[#1d3435] bg-white border border-[#e2ddd8] rounded-lg px-3 py-2 focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/15 transition-all disabled:opacity-50 cursor-pointer"
          >
            {SELECTABLE_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>
          {saving && (
            <svg className="w-4 h-4 text-[#3d7b74] animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          )}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Müşteri & Alıcı — 2 sütun */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Sol: Sipariş Veren */}
            <div className="bg-[#faf8f6] rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a09890] flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sipariş Veren
              </p>
              <InfoRow label="Ad Soyad" value={order.customer_name} />
              <InfoRow label="Telefon" value={order.customer_phone} />
              <InfoRow label="E-posta" value={order.email} />
              {order.payment_method && (
                <InfoRow label="Ödeme Yöntemi" value={paymentLabel[order.payment_method] ?? order.payment_method} />
              )}
            </div>

            {/* Sağ: Alıcı + Teslimat */}
            <div className="space-y-3">
              <div className="bg-[#faf8f6] rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a09890] flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Alıcı
                </p>
                <InfoRow label="Ad Soyad" value={order.recipient_name} />
                <InfoRow label="Telefon" value={order.recipient_phone} />
              </div>

              {/* Teslimat kutusu */}
              <div className="bg-[#eef6f5] border border-[#c8e6e1] rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4a8a82] flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Teslimat
                </p>
                {order.delivery_date && (
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a8a82]">Tarih & Saat</p>
                    <p className="text-[14px] font-bold text-[#1d3435]">
                      {order.delivery_date}
                      {order.delivery_time && <span className="text-[#3d7b74] ml-2">· {order.delivery_time.replace("-", ":00 – ")}:00</span>}
                    </p>
                  </div>
                )}
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a8a82]">Adres</p>
                  <p className="text-[13px] font-semibold text-[#1d3435] leading-snug">{order.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kart Mesajı */}
          {order.card_message && (
            <div className="flex gap-3 bg-[#fdf8f2] border border-[#e8ddd0] rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-[#c4956a] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#c4956a] mb-1">Kart Mesajı</p>
                <p className="text-[13px] text-[#6e5c44] leading-relaxed">&ldquo;{order.card_message}&rdquo;</p>
              </div>
            </div>
          )}

          {/* Sipariş İçeriği */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a09890] mb-3">Sipariş İçeriği</p>
            <div className="border border-[#ede8e3] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px]">
                <thead>
                  <tr className="bg-[#faf8f6] border-b border-[#ede8e3]">
                    {[["Ürün", ""], ["Adet", "text-center"], ["Birim", "text-right"], ["Toplam", "text-right"]].map(([h, cls]) => (
                      <th key={h} className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#a09890] ${cls}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f0eb]">
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-[#fdf9f6] transition-colors">
                      <td className="px-4 py-3 text-[13px] font-semibold text-[#1d3435]">{item.name}</td>
                      <td className="px-4 py-3 text-[13px] text-[#6e6560] text-center">{item.qty}</td>
                      <td className="px-4 py-3 text-[13px] text-[#6e6560] text-right">₺{item.price?.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-[#1d3435] text-right">₺{((item.qty ?? 1) * (item.price ?? 0)).toLocaleString("tr-TR")}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {(order.subtotal != null && order.subtotal !== order.total_amount) && (
                    <tr className="border-t border-[#ede8e3]">
                      <td colSpan={3} className="px-4 py-2 text-[12px] text-right text-[#6e6560]">Ara Toplam</td>
                      <td className="px-4 py-2 text-[13px] text-[#6e6560] text-right">₺{order.subtotal?.toLocaleString("tr-TR")}</td>
                    </tr>
                  )}
                  {(order.discount_amount ?? 0) > 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-[12px] text-right text-[#3d7b74]">
                        İndirim {order.coupon_code && <span className="font-mono bg-[#edf7f5] px-1.5 py-0.5 rounded ml-1">{order.coupon_code}</span>}
                      </td>
                      <td className="px-4 py-2 text-[13px] font-semibold text-[#3d7b74] text-right">-₺{order.discount_amount?.toLocaleString("tr-TR")}</td>
                    </tr>
                  )}
                  {(order.shipping_fee ?? 0) > 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-[12px] text-right text-[#6e6560]">Kargo Ücreti</td>
                      <td className="px-4 py-2 text-[13px] text-[#6e6560] text-right">₺{order.shipping_fee?.toLocaleString("tr-TR")}</td>
                    </tr>
                  )}
                  {(order.shipping_fee ?? 0) === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-[12px] text-right text-[#6e6560]">Kargo</td>
                      <td className="px-4 py-2 text-[13px] font-semibold text-[#3d7b74] text-right">Ücretsiz</td>
                    </tr>
                  )}
                  {(order.kapida_fee ?? 0) > 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-[12px] text-right text-[#6e6560]">Kapıda Ödeme Bedeli</td>
                      <td className="px-4 py-2 text-[13px] text-[#6e6560] text-right">₺{order.kapida_fee?.toLocaleString("tr-TR")}</td>
                    </tr>
                  )}
                  <tr className="bg-[#faf8f6] border-t-2 border-[#ede8e3]">
                    <td colSpan={3} className="px-4 py-3 text-[12px] font-bold text-right text-[#6e6560] uppercase tracking-wider">Genel Toplam</td>
                    <td className="px-4 py-3 text-[16px] font-black text-[#1d3435] text-right">₺{order.total_amount?.toLocaleString("tr-TR")}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            </div>
          </div>

          {/* Kurye / Kargo */}
          <div className="bg-[#faf8f6] rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a09890] mb-3 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13" rx="1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" strokeWidth={2} />
                <circle cx="18.5" cy="18.5" r="2.5" strokeWidth={2} />
              </svg>
              Kurye / Kargo Bilgisi
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTracking()}
                placeholder="Takip numarası girin..."
                className="flex-1 border border-[#e2ddd8] rounded-lg px-3 py-2.5 text-[13px] text-[#1d3435] placeholder:text-[#c0b8b0] focus:outline-none focus:border-[#3d7b74] focus:ring-2 focus:ring-[#3d7b74]/15 transition-all bg-white"
              />
              <button
                onClick={handleSaveTracking}
                disabled={saving}
                className="flex-shrink-0 px-4 py-2.5 bg-[#1d3435] hover:bg-[#243f40] text-white rounded-lg text-[12px] font-bold transition-colors disabled:opacity-50"
              >
                {trackingSaved ? "✓ Kaydedildi" : "Kaydet"}
              </button>
            </div>
          </div>

          {/* Müşteri Notu */}
          {order.notes && (
            <div className="flex gap-3 border border-[#e2ddd8] bg-white rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-[#a09890] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a09890] mb-1">Müşteri Notu</p>
                <p className="text-[13px] text-[#545454] leading-relaxed">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky Footer ── */}
        <div className="px-6 py-3.5 border-t border-[#f0ebe5] bg-white flex gap-2.5 justify-end flex-shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#e2ddd8] rounded-lg text-[12px] font-semibold text-[#6e6560] hover:border-[#1d3435] hover:text-[#1d3435] transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Yazdır
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1d3435] hover:bg-[#243f40] text-white rounded-lg text-[12px] font-bold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "all">("all");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    // Realtime subscription
    const channel = supabase
      .channel("siparisler_page")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => [payload.new as Order, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => prev.map((o) => o.id === (payload.new as Order).id ? payload.new as Order : o));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const handleOrderUpdated = useCallback((updated: Order) => {
    setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
    setSelectedOrder((prev) => prev?.id === updated.id ? updated : prev);
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const s of SELECTABLE_STATUSES) counts[s] = orders.filter((o) => o.status === s).length;
    return counts;
  }, [orders]);

  const filteredData = useMemo(() =>
    activeStatus === "all" ? orders : orders.filter((o) => o.status === activeStatus),
    [orders, activeStatus]
  );

  const columns: ColumnDef<Order>[] = useMemo(() => [
    {
      accessorKey: "order_number",
      header: "Sipariş No",
      cell: ({ row }) => (
        <button onClick={() => setSelectedOrder(row.original)}
          className="font-bold text-[#1d3435] hover:text-[#3d7b74] transition-colors text-[13px]">
          {row.original.order_number}
        </button>
      ),
    },
    {
      accessorKey: "customer_name",
      header: "Müşteri",
      cell: ({ row }) => (
        <div>
          <p className="text-[13px] font-semibold text-[#1d3435]">{row.original.customer_name}</p>
          <p className="text-[11px] text-[#999]">{row.original.customer_phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Tarih",
      cell: ({ getValue }) => <span className="text-[12px] text-[#545454]">{formatDate(getValue() as string)}</span>,
    },
    {
      accessorKey: "items",
      header: "Ürünler",
      cell: ({ row }) => {
        const items: OrderItem[] = Array.isArray(row.original.items) ? row.original.items : [];
        return (
          <div className="text-[12px] text-[#545454] max-w-[200px] truncate">
            {items.map((i) => i.name).join(", ")}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "total_amount",
      header: "Tutar",
      cell: ({ getValue }) => (
        <span className="text-[13px] font-bold text-[#1d3435]">
          ₺{(getValue() as number)?.toLocaleString("tr-TR")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Durum",
      cell: ({ row }) => {
        const status = row.original.status as OrderStatus;
        return (
          <select
            value={status}
            onChange={async (e) => {
              const res = await fetch(`/api/admin/orders/${row.original.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: e.target.value }),
              });
              if (res.ok) {
                const updated = await res.json();
                handleOrderUpdated(updated);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#e0e0e0] bg-white text-[#1d3435] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3d7b74]">
            {SELECTABLE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button onClick={() => setSelectedOrder(row.original)}
          className="text-[12px] text-[#3d7b74] hover:text-[#1d3435] font-semibold transition-colors flex items-center gap-1">
          Detay
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ),
    },
  ], [handleOrderUpdated]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const totalRevenue = orders
    .filter((o) => o.status === "Teslim Edildi")
    .reduce((s, o) => s + (o.total_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-medium text-[#1d3435]">Sipariş Yönetimi</h1>
          <p className="text-[13px] text-[#999]">Tüm siparişleri buradan takip edin</p>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-lg px-4 py-2.5 text-center shadow-sm self-start sm:self-auto">
          <p className="text-[10px] text-[#999] uppercase tracking-widest font-bold">Teslim Edilen Ciro</p>
          <p className="text-[15px] font-black text-[#1d3435]">₺{totalRevenue.toLocaleString("tr-TR")}</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveStatus("all")}
          className={`px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all ${activeStatus === "all" ? "bg-[#1d3435] text-white" : "bg-white border border-[#ebebeb] text-[#545454] hover:border-[#1d3435]"}`}>
          Tümü ({statusCounts.all})
        </button>
        {SELECTABLE_STATUSES.map((s) => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all ${activeStatus === s ? "bg-[#1d3435] text-white" : "bg-white border border-[#ebebeb] text-[#545454] hover:border-[#1d3435]"}`}>
            {STATUS_CONFIG[s].label} ({statusCounts[s] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#ebebeb] py-16 text-center text-[#999] text-[13px]">
          Siparişler yükleniyor...
        </div>
      ) : (
        <>
          {/* Mobil Arama */}
          <div className="md:hidden bg-white rounded-xl border border-[#ebebeb] shadow-sm flex items-center gap-3 px-4 py-3">
            <svg className="w-4 h-4 text-[#999] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Sipariş no veya müşteri ara..." value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="flex-1 text-[13px] focus:outline-none text-[#1d3435] placeholder-[#ccc]" />
          </div>

          {/* Mobil Kart Görünümü */}
          <div className="md:hidden space-y-3">
            {filteredData.length === 0 && (
              <div className="bg-white rounded-xl border border-[#ebebeb] py-12 text-center text-[#999] text-[13px]">Sipariş bulunamadı.</div>
            )}
            {filteredData.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-[#ebebeb] shadow-sm p-4 space-y-3 cursor-pointer"
                onClick={() => setSelectedOrder(order)}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[14px] text-[#1d3435]">{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1d3435]">{order.customer_name}</p>
                  <p className="text-[11px] text-[#999]">{order.customer_phone}</p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#f5f5f5]">
                  <span className="text-[12px] text-[#999]">{formatDate(order.created_at)}</span>
                  <span className="text-[14px] font-black text-[#1d3435]">₺{order.total_amount?.toLocaleString("tr-TR")}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Tablo */}
          <div className="hidden md:block bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f5f5f5]">
              <svg className="w-4 h-4 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Sipariş no, müşteri adı veya ürün ara..." value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="flex-1 text-[13px] focus:outline-none text-[#1d3435] placeholder-[#ccc]" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-[#f5f5f5] bg-[#fafafa]">
                      {hg.headers.map((header) => (
                        <th key={header.id} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#999]">
                          {header.isPlaceholder ? null : (
                            <div className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-[#1d3435]" : ""}`}
                              onClick={header.column.getToggleSortingHandler()}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() === "asc" && " ↑"}
                              {header.column.getIsSorted() === "desc" && " ↓"}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-16 text-[#999] text-[13px]">
                        Henüz sipariş yok.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id}
                        className="border-b border-[#f9f9f9] hover:bg-[#fafafa] transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(row.original)}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3.5">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#f5f5f5]">
              <p className="text-[12px] text-[#999]">
                {table.getFilteredRowModel().rows.length} sipariş — Sayfa {table.getState().pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
              </p>
              <div className="flex items-center gap-1">
                {["«", "‹", "›", "»"].map((btn, i) => (
                  <button key={btn}
                    onClick={() => [() => table.setPageIndex(0), () => table.previousPage(), () => table.nextPage(), () => table.setPageIndex(table.getPageCount() - 1)][i]()}
                    disabled={[!table.getCanPreviousPage(), !table.getCanPreviousPage(), !table.getCanNextPage(), !table.getCanNextPage()][i]}
                    className="px-2.5 py-1.5 text-[12px] border border-[#e8e8e8] rounded-md text-[#545454] hover:border-[#1d3435] disabled:opacity-40 transition-colors">
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
}
