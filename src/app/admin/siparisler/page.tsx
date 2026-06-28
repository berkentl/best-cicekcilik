"use client";

import { useState, useMemo } from "react";
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

type OrderStatus = "Yeni" | "Hazırlanıyor" | "Kargoya Verildi" | "Teslim Edildi" | "İptal" | "İade";

interface OrderItem { name: string; qty: number; price: number }
interface Order {
  id: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  note?: string;
  trackingNo?: string;
}

// Mock veri — gerçek sipariş DB'si kurulunca API'den çekilecek
const ORDERS: Order[] = [
  { id: "#10241", customer: "Ayşe Kaya", phone: "0532 111 22 33", email: "ayse@email.com", address: "Beşiktaş, İstanbul", date: "2026-06-26 14:32", items: [{ name: "Kırmızı Gül Buketi", qty: 1, price: 450 }, { name: "Çikolata Kutu", qty: 1, price: 200 }], total: 650, status: "Hazırlanıyor", note: "Kırmızı kurdelayla bağlayın" },
  { id: "#10240", customer: "Mehmet Demir", phone: "0533 222 33 44", email: "mehmet@email.com", address: "Kadıköy, İstanbul", date: "2026-06-26 12:15", items: [{ name: "Orkide Set", qty: 1, price: 420 }], total: 420, status: "Kargoya Verildi", trackingNo: "TR123456789" },
  { id: "#10239", customer: "Fatma Şahin", phone: "0534 333 44 55", email: "fatma@email.com", address: "Şişli, İstanbul", date: "2026-06-26 10:05", items: [{ name: "Beyaz Orkide", qty: 2, price: 380 }, { name: "Hediye Kutusu", qty: 1, price: 130 }], total: 890, status: "Teslim Edildi" },
  { id: "#10238", customer: "Ali Öztürk", phone: "0535 444 55 66", email: "ali@email.com", address: "Üsküdar, İstanbul", date: "2026-06-25 18:44", items: [{ name: "Pastel Buket", qty: 1, price: 320 }], total: 320, status: "Yeni" },
  { id: "#10237", customer: "Zeynep Arslan", phone: "0536 555 66 77", email: "zeynep@email.com", address: "Sarıyer, İstanbul", date: "2026-06-25 16:20", items: [{ name: "Premium Gül", qty: 1, price: 750 }, { name: "Çikolata", qty: 3, price: 150 }], total: 1200, status: "Teslim Edildi" },
  { id: "#10236", customer: "Hasan Yıldız", phone: "0537 666 77 88", email: "hasan@email.com", address: "Bakırköy, İstanbul", date: "2026-06-25 11:30", items: [{ name: "Lilyum Buketi", qty: 1, price: 380 }], total: 380, status: "İptal", note: "Müşteri iptal etti" },
  { id: "#10235", customer: "Meryem Koç", phone: "0538 777 88 99", email: "meryem@email.com", address: "Ataşehir, İstanbul", date: "2026-06-24 09:15", items: [{ name: "Doğum Günü Seti", qty: 1, price: 680 }], total: 680, status: "Teslim Edildi" },
  { id: "#10234", customer: "İbrahim Çelik", phone: "0539 888 99 00", email: "ibrahim@email.com", address: "Maltepe, İstanbul", date: "2026-06-24 15:45", items: [{ name: "Anneler Günü Buketi", qty: 1, price: 520 }], total: 520, status: "İade", note: "Güller solmuş gelmiş" },
];

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  "Yeni":           { color: "text-blue-700",   bg: "bg-blue-100",   label: "Yeni" },
  "Hazırlanıyor":   { color: "text-yellow-700", bg: "bg-yellow-100", label: "Hazırlanıyor" },
  "Kargoya Verildi":{ color: "text-purple-700", bg: "bg-purple-100", label: "Kargoya Verildi" },
  "Teslim Edildi":  { color: "text-green-700",  bg: "bg-green-100",  label: "Teslim Edildi" },
  "İptal":          { color: "text-red-700",    bg: "bg-red-100",    label: "İptal" },
  "İade":           { color: "text-orange-700", bg: "bg-orange-100", label: "İade" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as OrderStatus[];

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const [tracking, setTracking] = useState(order.trackingNo ?? "");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <div>
            <h2 className="font-bold text-[16px] text-[#1d3435]">Sipariş {order.id}</h2>
            <p className="text-[12px] text-[#999]">{order.date}</p>
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-[#1d3435] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Durum */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Durum:</span>
            <StatusBadge status={order.status} />
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className="ml-auto border border-[#e8e8e8] rounded-md px-3 py-1.5 text-[12px] font-semibold focus:outline-none focus:border-[#3d7b74] transition-all">
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Müşteri */}
          <div className="bg-[#f9f9f9] rounded-lg p-4 space-y-2">
            <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest mb-3">Müşteri Bilgileri</p>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div><span className="text-[#999]">Ad Soyad:</span> <span className="font-semibold text-[#1d3435]">{order.customer}</span></div>
              <div><span className="text-[#999]">Telefon:</span> <span className="font-semibold text-[#1d3435]">{order.phone}</span></div>
              <div><span className="text-[#999]">E-posta:</span> <span className="font-semibold text-[#1d3435]">{order.email}</span></div>
              <div><span className="text-[#999]">Adres:</span> <span className="font-semibold text-[#1d3435]">{order.address}</span></div>
            </div>
          </div>

          {/* Ürünler */}
          <div>
            <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest mb-3">Sipariş İçeriği</p>
            <div className="border border-[#f0f0f0] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f9f9f9] border-b border-[#f0f0f0]">
                    {["Ürün", "Adet", "Birim Fiyat", "Toplam"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#999]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b border-[#f9f9f9]">
                      <td className="px-4 py-3 text-[13px] font-semibold text-[#1d3435]">{item.name}</td>
                      <td className="px-4 py-3 text-[13px] text-[#545454]">{item.qty}</td>
                      <td className="px-4 py-3 text-[13px] text-[#545454]">₺{item.price.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-[#1d3435]">₺{(item.qty * item.price).toLocaleString("tr-TR")}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#f9f9f9]">
                    <td colSpan={3} className="px-4 py-3 text-[13px] font-bold text-right text-[#1d3435]">Genel Toplam</td>
                    <td className="px-4 py-3 text-[14px] font-black text-[#1d3435]">₺{order.total.toLocaleString("tr-TR")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Kargo Takip */}
          <div>
            <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest mb-2">Kargo Takip No</p>
            <div className="flex gap-2">
              <input type="text" value={tracking} onChange={(e) => setTracking(e.target.value)}
                placeholder="Takip numarası girin..."
                className="flex-1 border border-[#e8e8e8] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[#3d7b74] transition-all" />
              <button className="px-4 py-2 bg-[#3d7b74] text-white rounded-md text-[13px] font-semibold hover:bg-[#1d3435] transition-colors">
                Kaydet
              </button>
            </div>
          </div>

          {/* Not */}
          {order.note && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-[11px] font-bold text-yellow-700 uppercase tracking-widest mb-1">Müşteri Notu</p>
              <p className="text-[13px] text-yellow-800">{order.note}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#f0f0f0] flex gap-3 justify-end">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-[#e8e8e8] rounded-md text-[13px] text-[#545454] font-semibold hover:border-[#1d3435] hover:text-[#1d3435] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Yazdır
          </button>
          <button onClick={onClose} className="px-5 py-2 bg-[#1d3435] text-white rounded-md text-[13px] font-bold hover:bg-[#2a4a4b] transition-colors">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSiparislerPage() {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "all">("all");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = (id: string, status: OrderStatus) => {
    setOrders((p) => p.map((o) => o.id === id ? { ...o, status } : o));
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const s of ALL_STATUSES) counts[s] = orders.filter((o) => o.status === s).length;
    return counts;
  }, [orders]);

  const filteredData = useMemo(() =>
    activeStatus === "all" ? orders : orders.filter((o) => o.status === activeStatus),
    [orders, activeStatus]
  );

  const columns: ColumnDef<Order>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "Sipariş No",
      cell: ({ row }) => (
        <button onClick={() => setSelectedOrder(row.original)}
          className="font-bold text-[#1d3435] hover:text-[#3d7b74] transition-colors text-[13px]">
          {row.original.id}
        </button>
      ),
    },
    {
      accessorKey: "customer",
      header: "Müşteri",
      cell: ({ row }) => (
        <div>
          <p className="text-[13px] font-semibold text-[#1d3435]">{row.original.customer}</p>
          <p className="text-[11px] text-[#999]">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Tarih",
      cell: ({ getValue }) => <span className="text-[12px] text-[#545454]">{getValue() as string}</span>,
    },
    {
      accessorKey: "items",
      header: "Ürünler",
      cell: ({ row }) => (
        <div className="text-[12px] text-[#545454]">
          {row.original.items.map((i) => i.name).join(", ")}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "total",
      header: "Tutar",
      cell: ({ getValue }) => (
        <span className="text-[13px] font-bold text-[#1d3435]">
          ₺{(getValue() as number).toLocaleString("tr-TR")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Durum",
      cell: ({ row }) => (
        <select
          value={row.original.status}
          onChange={(e) => handleStatusChange(row.original.id, e.target.value as OrderStatus)}
          onClick={(e) => e.stopPropagation()}
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3d7b74] ${STATUS_CONFIG[row.original.status].bg} ${STATUS_CONFIG[row.original.status].color}`}>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
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
  ], []);

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

  const totalRevenue = filteredData
    .filter((o) => o.status === "Teslim Edildi")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1d3435]">Sipariş Yönetimi</h1>
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
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all ${activeStatus === s ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}` : "bg-white border border-[#ebebeb] text-[#545454] hover:border-[#1d3435]"}`}>
            {s} ({statusCounts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* ── Mobil Arama (md altı) ── */}
      <div className="md:hidden bg-white rounded-xl border border-[#ebebeb] shadow-sm flex items-center gap-3 px-4 py-3">
        <svg className="w-4 h-4 text-[#999] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Sipariş no veya müşteri ara..." value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="flex-1 text-[13px] focus:outline-none text-[#1d3435] placeholder-[#ccc]" />
        {globalFilter && (
          <button onClick={() => setGlobalFilter("")} className="text-[#999]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Mobil Kart Görünümü (md altı) ── */}
      <div className="md:hidden space-y-3">
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ebebeb] py-12 text-center text-[#999] text-[13px]">Sipariş bulunamadı.</div>
        )}
        {filteredData.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-[#ebebeb] shadow-sm p-4 space-y-3"
            onClick={() => setSelectedOrder(order)}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[14px] text-[#1d3435]">{order.id}</span>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1d3435]">{order.customer}</p>
              <p className="text-[11px] text-[#999]">{order.phone}</p>
            </div>
            <p className="text-[12px] text-[#545454] line-clamp-1">
              {order.items.map((i) => i.name).join(", ")}
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-[#f5f5f5]">
              <span className="text-[12px] text-[#999]">{order.date.split(" ")[0]}</span>
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-black text-[#1d3435]">₺{order.total.toLocaleString("tr-TR")}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                  className="text-[12px] text-[#3d7b74] font-semibold flex items-center gap-1"
                >
                  Detay
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredData.length > 0 && (
          <p className="text-center text-[12px] text-[#999] pb-2">{filteredData.length} sipariş</p>
        )}
      </div>

      {/* ── Desktop Tablo (md üstü) ── */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f5f5f5]">
          <svg className="w-4 h-4 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Sipariş no, müşteri adı veya ürün ara..." value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="flex-1 text-[13px] focus:outline-none text-[#1d3435] placeholder-[#ccc]" />
          {globalFilter && (
            <button onClick={() => setGlobalFilter("")} className="text-[#999] hover:text-[#1d3435]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-[#f5f5f5] bg-[#fafafa]">
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#999]">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-[#1d3435]" : ""}`}
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
                    Sipariş bulunamadı.
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#f5f5f5]">
          <p className="text-[12px] text-[#999]">
            {table.getFilteredRowModel().rows.length} sipariş —{" "}
            Sayfa {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}
              className="px-2.5 py-1.5 text-[12px] border border-[#e8e8e8] rounded-md text-[#545454] hover:border-[#1d3435] disabled:opacity-40 transition-colors">«</button>
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
              className="px-2.5 py-1.5 text-[12px] border border-[#e8e8e8] rounded-md text-[#545454] hover:border-[#1d3435] disabled:opacity-40 transition-colors">‹</button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
              className="px-2.5 py-1.5 text-[12px] border border-[#e8e8e8] rounded-md text-[#545454] hover:border-[#1d3435] disabled:opacity-40 transition-colors">›</button>
            <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}
              className="px-2.5 py-1.5 text-[12px] border border-[#e8e8e8] rounded-md text-[#545454] hover:border-[#1d3435] disabled:opacity-40 transition-colors">»</button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(id, status) => {
            handleStatusChange(id, status);
            setSelectedOrder((p) => p && p.id === id ? { ...p, status } : p);
          }}
        />
      )}
    </div>
  );
}
