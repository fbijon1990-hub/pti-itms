"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveCompetency(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "").trim();
  const row = { name: String(formData.get("name") || ""), area: String(formData.get("area") || "") };
  if (id) await sb.from("competencies").update(row).eq("id", id);
  else await sb.from("competencies").insert(row);
  revalidatePath("/competencies");
}

export async function deleteCompetency(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("competencies").delete().eq("id", id);
  revalidatePath("/competencies");
}

export async function saveRecord(formData: FormData) {
  const sb = createClient();
  await sb.from("competency_records").insert({
    participant_id: String(formData.get("participant_id") || ""),
    competency_id: String(formData.get("competency_id") || ""),
    training_id: String(formData.get("training_id") || ""),
    pre: Number(formData.get("pre") || 0),
    post: Number(formData.get("post") || 0)
  });
  revalidatePath("/competencies");
}

export async function deleteRecord(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("competency_records").delete().eq("id", id);
  revalidatePath("/competencies");
}
