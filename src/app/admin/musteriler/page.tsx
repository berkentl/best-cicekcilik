"use client";

export default function AdminMusterilerPage() {
  const mockCustomers: { id: string; name: string; email: string; phone: string; orders: number; total: number; joined: string }[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1d3435]">Müşteri Yönetimi</h1>
        <p className="text-[13px] text-[#999]">Müşteri profilleri ve satın alma geçmişleri</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Toplam Müşteri", value: mockCustomers.length.toString() },
          { label: "Bu Ay Yeni", value: "2" },
          { label: "Ort. Sipariş Değeri", value: "₺960" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#ebebeb] p-5 shadow-sm">
            <p className="text-[11px] text-[#999] uppercase tracking-widest font-bold mb-1">{s.label}</p>
            <p className="text-2xl font-black text-[#1d3435]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#ebebeb] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f5f5f5]">
          <h2 className="text-[14px] font-bold text-[#1d3435]">Müşteri Listesi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f5f5f5] bg-[#fafafa]">
                {["Müşteri", "E-posta", "Telefon", "Sipariş", "Toplam Harcama", "Kayıt Tarihi"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#999]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-[13px] text-[#999]">
                    Henüz kayıtlı müşteri yok
                  </td>
                </tr>
              ) : mockCustomers.map((c) => (
                <tr key={c.id} className="border-b border-[#f9f9f9] hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1d3435]/10 flex items-center justify-center text-[12px] font-bold text-[#1d3435]">
                        {c.name.charAt(0)}
                      </div>
                      <span className="text-[13px] font-semibold text-[#1d3435]">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#545454]">{c.email}</td>
                  <td className="px-4 py-3.5 text-[13px] text-[#545454]">{c.phone}</td>
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-[#1d3435]">{c.orders} sipariş</td>
                  <td className="px-4 py-3.5 text-[13px] font-bold text-[#3d7b74]">₺{c.total.toLocaleString("tr-TR")}</td>
                  <td className="px-4 py-3.5 text-[12px] text-[#999]">{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
