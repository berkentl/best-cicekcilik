"use server";

import { createServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import type { IbanEntry } from "@/types";

const TABLE = "payment_settings";
const ROW_ID = 1;

async function getRow() {
  const sb = createServerClient();
  const { data } = await sb
    .from(TABLE)
    .select("havale_ibans")
    .eq("id", ROW_ID)
    .maybeSingle();
  return data;
}

export async function updateKapidaSettings(enabled: boolean, fee: number) {
  const sb = createServerClient();
  const { error } = await sb
    .from(TABLE)
    .update({ kapida_enabled: enabled, kapida_fee: fee, updated_at: new Date().toISOString() })
    .eq("id", ROW_ID);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/odeme-ayarlari");
  revalidatePath("/odeme");
}

export async function updateHavaleEnabled(enabled: boolean) {
  const sb = createServerClient();
  const { error } = await sb
    .from(TABLE)
    .update({ havale_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("id", ROW_ID);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/odeme-ayarlari");
  revalidatePath("/odeme");
}

export async function addIban(entry: Omit<IbanEntry, "id">) {
  const row = await getRow();
  const existing: IbanEntry[] = Array.isArray(row?.havale_ibans) ? (row.havale_ibans as IbanEntry[]) : [];
  const newEntry: IbanEntry = { ...entry, id: crypto.randomUUID() };
  const sb = createServerClient();
  const { error } = await sb
    .from(TABLE)
    .update({ havale_ibans: [...existing, newEntry], updated_at: new Date().toISOString() })
    .eq("id", ROW_ID);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/odeme-ayarlari");
  revalidatePath("/odeme");
}

export async function deleteIban(id: string) {
  const row = await getRow();
  const existing: IbanEntry[] = Array.isArray(row?.havale_ibans) ? (row.havale_ibans as IbanEntry[]) : [];
  const filtered = existing.filter((e) => e.id !== id);
  const sb = createServerClient();
  const { error } = await sb
    .from(TABLE)
    .update({ havale_ibans: filtered, updated_at: new Date().toISOString() })
    .eq("id", ROW_ID);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/odeme-ayarlari");
  revalidatePath("/odeme");
}
