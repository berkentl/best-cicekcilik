"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PackageIcon, ChevronDownIcon } from "@/components/icons";
import { STATUS_CONFIG, TIMELINE_STEPS } from "@/components/account/orderStatus";
import type { CustomerOrder, OrderStatus } from "@/types";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export function OrdersList() {
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((data: CustomerOrder[]) => setOrders(data))
      .catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white border border-[#ede8e3] animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#ede8e3] text-center py-16 px-6">
        <PackageIcon size={40} className="text-[#e2ddd8] mx-auto mb-4" />
        <p className="text-[#8a9c9c] text-[14px] mb-5">Henüz bir siparişiniz bulunmuyor.</p>
        <Link href="/tum-urunler" className="btn-primary">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-poppins text-2xl font-semibold text-[#1d3435] mb-6">Siparişlerim</h1>
      <div className="space-y-3">
        {orders.map((order) => {
          const isOpen = openId === order.id;
          const cfg = STATUS_CONFIG[order.status as OrderStatus];
          const cancelled = cfg.step === -1;

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-[#ede8e3] overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : order.id)}
                className="w-full flex flex-wrap items-center justify-between gap-3 px-5 md:px-6 py-4 text-left"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[#1d3435]">#{order.orderNumber}</p>
                  <p className="text-[12px] text-[#8a9c9c] mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11.5px] font-semibold px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                    {order.status}
                  </span>
                  <p className="text-[14px] font-semibold text-[#1d3435] hidden sm:block">
                    ₺{order.totalAmount.toLocaleString("tr-TR")}
                  </p>
                  <ChevronDownIcon
                    size={14}
                    className={`text-[#a8a0ba] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden border-t border-[#f0ebe6]"
                  >
                    <div className="px-5 md:px-6 py-5 space-y-5">
                      {/* Ürünler */}
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-[13px]">
                            <span className="text-[#1d3435]">
                              {item.name} <span className="text-[#8a9c9c]">×{item.qty}</span>
                            </span>
                            <span className="font-semibold text-[#1d3435]">
                              ₺{(item.price * item.qty).toLocaleString("tr-TR")}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="text-[12.5px] text-[#666] leading-relaxed border-t border-[#f0ebe6] pt-4">
                        <p>
                          <span className="text-[#8a9c9c]">Teslimat Adresi:</span> {order.address}
                        </p>
                        <p className="mt-0.5">
                          <span className="text-[#8a9c9c]">Alıcı:</span> {order.recipientName}
                        </p>
                        {order.trackingNumber && (
                          <p className="mt-0.5">
                            <span className="text-[#8a9c9c]">Takip No:</span> {order.trackingNumber}
                          </p>
                        )}
                      </div>

                      {/* Mini takip çubuğu */}
                      {!cancelled && (
                        <div className="pt-2">
                          <div className="relative flex items-center justify-between">
                            <div className="absolute top-2 left-2 right-2 h-[2px] bg-[#ede8e3]" />
                            <motion.div
                              className="absolute top-2 left-2 h-[2px] bg-[#1d3435] origin-left"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: order.trackingStep / (TIMELINE_STEPS.length - 1) }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              style={{ width: "calc(100% - 16px)" }}
                            />
                            {TIMELINE_STEPS.map((label, i) => {
                              const done = i <= order.trackingStep;
                              return (
                                <div key={label} className="relative z-10 flex flex-col items-center gap-1.5" style={{ width: 16 }}>
                                  <span
                                    className={`w-4 h-4 rounded-full border-2 ${
                                      done ? "bg-[#1d3435] border-[#1d3435]" : "bg-white border-[#e2ddd8]"
                                    }`}
                                  />
                                  <span className={`text-[10px] whitespace-nowrap text-center ${done ? "text-[#1d3435] font-medium" : "text-[#c5bdb5]"}`}>
                                    {label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Link
                          href={`/siparis-takip`}
                          className="text-[12.5px] font-semibold text-[#3d7b74] hover:underline"
                        >
                          Detaylı Takip →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
