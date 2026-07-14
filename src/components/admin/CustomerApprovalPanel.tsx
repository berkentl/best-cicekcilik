"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import type { Order } from "@/app/admin/siparisler/page";

function formatCountdown(ms: number) {
  const clamped = Math.max(0, ms);
  const totalSec = Math.floor(clamped / 1000);
  const mm = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function CustomerApprovalPanel({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated: (updated: Order) => void;
}) {
  const status = order.approval_status ?? "NOT_REQUIRED";

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Seçilen dosya için yerel önizleme oluştur/temizle
  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // "Onay Bekleniyor" durumunda saniyede bir güncellenen canlı geri sayım
  useEffect(() => {
    if (status !== "PENDING" || !order.approval_expires_at) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status, order.approval_expires_at]);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setFile(accepted[0]); setError(null); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    onDropRejected: () => setError("Dosya reddedildi. Sadece resim dosyaları (JPG, PNG, WEBP) kabul edilir."),
  });

  const handleSendForApproval = async () => {
    if (!file) return;
    setSending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.url) {
        throw new Error(uploadJson.error ?? "Görsel yüklenemedi.");
      }

      const approvalRes = await fetch(`/api/orders/${order.id}/request-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalImageUrl: uploadJson.url }),
      });
      const approvalJson = await approvalRes.json();
      if (!approvalRes.ok) {
        throw new Error(approvalJson.error ?? "Onay talebi gönderilemedi.");
      }

      onUpdated(approvalJson.order);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmedik bir hata oluştu.");
    } finally {
      setSending(false);
    }
  };

  const remainingMs = order.approval_expires_at
    ? new Date(order.approval_expires_at).getTime() - now
    : 0;
  const expired = status === "PENDING" && remainingMs <= 0;

  return (
    <div className="bg-[#faf8f6] rounded-xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a09890] mb-3 flex items-center gap-1.5">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Müşteri Onay Paneli
      </p>

      {status === "NOT_REQUIRED" && (
        <div className="space-y-3">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-[#3d7b74] bg-[#3d7b74]/5" : "border-[#e2ddd8] hover:border-[#c9c2b8] bg-white"
            }`}
          >
            <input {...getInputProps()} />
            {previewUrl ? (
              <div className="flex items-center gap-3 text-left">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-[#e8e8e8]">
                  <Image src={previewUrl} alt="Seçilen görsel" fill unoptimized className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1d3435] truncate">{file?.name}</p>
                  <p className="text-[11px] text-[#a09890]">Değiştirmek için tıklayın veya sürükleyin</p>
                </div>
              </div>
            ) : (
              <>
                <svg className="w-6 h-6 mx-auto mb-2 text-[#c0b8b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[13px] font-medium text-[#1d3435]">Çiçek fotoğrafını sürükleyin veya tıklayın</p>
                <p className="text-[11px] text-[#a09890] mt-1">PNG, JPG, WEBP — maks. 5MB</p>
              </>
            )}
          </div>

          {error && <p className="text-[12px] text-red-600 font-medium">{error}</p>}

          <button
            onClick={handleSendForApproval}
            disabled={!file || sending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[12.5px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gönderiliyor...
              </>
            ) : (
              "Onaya Gönder"
            )}
          </button>
        </div>
      )}

      {status === "PENDING" && (
        <div className="flex items-center gap-3 bg-white border border-[#e2ddd8] rounded-xl px-4 py-3">
          {order.approval_image_url && (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#e8e8e8]">
              <Image src={order.approval_image_url} alt="Onaya gönderilen görsel" fill unoptimized className="object-cover" sizes="48px" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-amber-700">Durum: Onay Bekleniyor</p>
            <p className="text-[11px] text-[#a09890] mt-0.5">
              {expired ? "Süre doldu, müşteri yanıtı bekleniyor." : "Müşteriye SMS ile gönderildi."}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#a09890]">Kalan Süre</p>
            <p className={`text-[18px] font-black tabular-nums ${expired ? "text-red-500" : "text-[#1d3435]"}`}>
              {formatCountdown(remainingMs)}
            </p>
          </div>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-[13px] font-bold text-red-700">Müşteri Reddetti!</p>
            <p className="text-[12.5px] text-red-600 mt-0.5">
              Sebep: {order.rejection_reason || "Belirtilmedi"}
            </p>
          </div>
        </div>
      )}

      {status === "APPROVED" && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75l2.25 2.25L15 9m6 3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[13px] font-bold text-green-700">
            Müşteri Onayladı (veya Süre Doldu, Otomatik Onaylandı)
          </p>
        </div>
      )}
    </div>
  );
}
