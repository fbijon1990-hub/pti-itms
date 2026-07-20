"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveFacilitator(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "").trim();
  const row = {
    name: String(formData.get("name") || ""),
    title: String(formData.get("title") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    rate: Number(formData.get("rate") || 0),
    pay_mode: String(formData.get("pay_mode") || ""),
    pay_ref: String(formData.get("pay_ref") || ""),
    tax: Number(formData.get("tax") || 7.5)
  };
  if (id) await sb.from("facilitators").update(row).eq("id", id);
  else await sb.from("facilitators").insert(row);
  revalidatePath("/facilitators");
}

export async function deleteFacilitator(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("facilitators").delete().eq("id", id);
  revalidatePath("/facilitators");
}

export async function saveHonorarium(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "").trim();
  const days = Number(formData.get("days") || 0);
  const rate = Number(formData.get("rate") || 0);
  const row = {
    training_id: String(formData.get("training_id") || ""),
    facilitator_id: String(formData.get("facilitator_id") || ""),
    days,
    rate,
    gross: days * rate,
    status: String(formData.get("status") || "Pending")
  };
  if (id) await sb.from("honoraria").update(row).eq("id", id);
  else await sb.from("honoraria").insert(row);
  revalidatePath("/facilitators");
}

export async function setHonorariumStatus(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "Pending");
  if (id) await sb.from("honoraria").update({ status }).eq("id", id);
  revalidatePath("/facilitators");
}

export async function deleteHonorarium(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("honoraria").delete().eq("id", id);
  revalidatePath("/facilitators");
}
