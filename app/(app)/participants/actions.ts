"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveParticipant(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "").trim();
  const row = {
    name: String(formData.get("name") || ""),
    gender: String(formData.get("gender") || ""),
    institution: String(formData.get("institution") || "Parliament of Ghana"),
    dept: String(formData.get("dept") || ""),
    position: String(formData.get("position") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || "")
  };
  if (id) await sb.from("participants").update(row).eq("id", id);
  else await sb.from("participants").insert(row);
  revalidatePath("/participants");
}

export async function deleteParticipant(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("participants").delete().eq("id", id);
  revalidatePath("/participants");
}
