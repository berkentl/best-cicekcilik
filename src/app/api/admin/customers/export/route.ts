import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAggregatedCustomers } from "@/lib/customers";

/** "Ayşe Yılmaz" -> ["Ayşe", "Yılmaz"], tek kelimelik isimlerde soyad boş kalır. */
function splitName(fullName: string): [string, string] {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return [trimmed, ""];
  return [trimmed.slice(0, spaceIndex), trimmed.slice(spaceIndex + 1)];
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const memberOnly = searchParams.get("memberOnly") === "true";
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  let customers = await getAggregatedCustomers();
  customers = customers.filter((c) => {
    if (memberOnly && !c.isMember) return false;
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const header = ["Ad", "Soyad", "Telefon", "E-posta", "Toplam Sipariş Tutarı"];
  const rows = customers.map((c) => {
    const [firstName, lastName] = splitName(c.name);
    return [firstName, lastName, c.phone === "—" ? "" : c.phone, c.email, c.total.toFixed(2)];
  });

  const csvContent = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n");

  // Excel'in Türkçe karakterleri (ğ, ş, ı, ö, ü, ç) doğru göstermesi için UTF-8 BOM.
  const bom = String.fromCharCode(0xfeff);

  // Dosya adındaki tarih, saat dilimi kaymasını önlemek için tarayıcıdan (yerel saat) geliyor.
  const clientDate = searchParams.get("date");
  const dateStr = clientDate && /^\d{2}-\d{2}-\d{4}$/.test(clientDate) ? clientDate : formatServerDate();
  const filename = `Dunyanin-cicegi-musteriler-${dateStr}.csv`;

  return new NextResponse(bom + csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function formatServerDate(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
