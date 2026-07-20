"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveBudget(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "");
  if (id) await sb.from("budgets").update({ title }).eq("id", id);
  else await sb.from("budgets").insert({ title });
  revalidatePath("/budgets");
}

export async function deleteBudget(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("budgets").delete().eq("id", id);
  revalidatePath("/budgets");
}

export async function saveLine(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "").trim();
  const row = {
    budget_id: String(formData.get("budget_id") || ""),
    item: String(formData.get("item") || ""),
    budget: Number(formData.get("budget") || 0),
    actual: Number(formData.get("actual") || 0)
  };
  if (id) await sb.from("budget_lines").update(row).eq("id", id);
  else await sb.from("budget_lines").insert(row);
  revalidatePath("/budgets");
}

export async function deleteLine(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("budget_lines").delete().eq("id", id);
  revalidatePath("/budgets");
}
