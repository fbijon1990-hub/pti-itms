"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveSettings(formData: FormData) {
  const sb = createClient();
  await sb.from("institution").update({
    name: String(formData.get("name") || ""),
    parent: String(formData.get("parent") || ""),
    location: String(formData.get("location") || ""),
    signatory1: String(formData.get("signatory1") || ""),
    signatory2: String(formData.get("signatory2") || ""),
    cert_prefix: String(formData.get("cert_prefix") || "PTI"),
    pass_mark: Number(formData.get("pass_mark") || 12),
    attendance_min: Number(formData.get("attendance_min") || 70)
  }).eq("id", "default");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
