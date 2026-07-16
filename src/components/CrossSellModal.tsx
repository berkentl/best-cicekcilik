"use client";

import { useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/currency";
import { CheckCircleIcon, PlusIcon, XIcon, ArrowRightIcon } from "@/components/icons";
import type { Product } from "@/types";

const PLACEHOLDER = "/images/urunler/urun-1a.jpg";

interface Props {
  open: boolean;
  title: string;
  products: Product[];
  onClose: () => void;
  onProceed: (selected: Product[]) => void;
}

export function CrossSellModal({ open, title, products, onClose, onProceed }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  const handleProceed = () => {
    const selected = products.filter((p) => selectedIds.has(p.id));
    onProceed(selected);
  };

  const handleSkip = () => {
    onProceed([]);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 bg-[#0f1f1a]/55 z-[900]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[901] w-[92vw] max-w-[560px] max-h-[88vh] overflow-y-auto bg-white rounded-3xl shadow-[0_24px_80px_-16px_rgba(15,31,26,0.35)]"
              >
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 md:px-8 pt-7 pb-4 border-b border-[#f0ebe6] flex items-start justify-between gap-4 rounded-t-3xl">
                  <div>
                    <Dialog.Title className="font-poppins text-[19px] md:text-[21px] font-semibold text-[#1d3435] leading-snug">
                      {title}
                    </Dialog.Title>
                    <Dialog.Description className="text-[12.5px] text-[#8a9c9c] mt-1">
                      Siparişinize eklemek ister misiniz?
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="flex-shrink-0 text-[#a8a0ba] hover:text-[#1d3435] transition-colors p-1 -mt-1 -mr-1"
                      aria-label="Kapat"
                    >
                      <XIcon size={18} />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="px-6 md:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((product) => {
                    const isSelected = selectedIds.has(product.id);
                    const unitPrice = product.salePrice ?? product.price;
                    return (
                      <div
                        key={product.id}
                        className={`rounded-2xl border p-3 transition-all duration-200 ${
                          isSelected ? "border-[#3d7b74] bg-[#f5f9f8]" : "border-[#ede8e3] bg-white"
                        }`}
                      >
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#f5f3f3] mb-3">
                          <Image
                            src={product.images?.[0] ?? PLACEHOLDER}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="(max-width: 640px) 45vw, 240px"
                          />
                        </div>
                        <p className="text-[13.5px] font-semibold text-[#1d3435] leading-snug line-clamp-2 mb-1">
                          {product.name}
                        </p>
                        <p className="text-[14px] font-semibold text-[#3d7b74] mb-3">
                          {formatPrice(unitPrice)}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggle(product.id)}
                          className={`w-full flex items-center justify-center gap-1.5 text-[12.5px] font-semibold py-2 rounded-xl transition-all duration-200 ${
                            isSelected
                              ? "bg-[#3d7b74] text-white"
                              : "bg-[#f5f3f3] text-[#1d3435] hover:bg-[#ece7e2]"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircleIcon size={14} /> Eklendi
                            </>
                          ) : (
                            <>
                              <PlusIcon size={13} /> Sepete Ekle
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="px-6 md:px-8 pb-7 pt-1 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleProceed}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#1d3435] hover:bg-[#243f40] active:bg-[#162828] text-white font-semibold text-[14px] tracking-wide py-4 rounded-2xl transition-all duration-150 shadow-md hover:shadow-lg"
                  >
                    {selectedIds.size > 0 ? `Sepete Ekle ve Devam Et (${selectedIds.size})` : "Devam Et"}
                    <ArrowRightIcon size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="w-full text-center text-[13px] text-[#8a9c9c] hover:text-[#1d3435] transition-colors py-1.5"
                  >
                    Hayır Teşekkürler, Ödemeye Geç
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
