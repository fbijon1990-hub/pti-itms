"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveEvaluation(formData: FormData) {
  const sb = createClient();
  await sb.from("evaluations").insert({
    training_id: String(formData.get("training_id") || ""),
    participant_id: String(formData.get("participant_id") || ""),
    content: Number(formData.get("content") || 0),
    facilitation: Number(formData.get("facilitation") || 0),
    materials: Number(formData.get("materials") || 0),
    logistics: Number(formData.get("logistics") || 0),
    overall: Number(formData.get("overall") || 0),
    comment: String(formData.get("comment") || "")
  });
  revalidatePath("/evaluations");
  revalidatePath("/dashboard");
}

export async function deleteEvaluation(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("evaluations").delete().eq("id", id);
  revalidatePath("/evaluations");
  revalidatePath("/dashboard");
}
