"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveCohort(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "").trim();
  const row = {
    training_id: String(formData.get("training_id") || ""),
    name: String(formData.get("name") || ""),
    capacity: Number(formData.get("capacity") || 12)
  };
  if (id) await sb.from("cohorts").update(row).eq("id", id);
  else await sb.from("cohorts").insert(row);
  revalidatePath("/cohorts");
}

export async function deleteCohort(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("cohorts").delete().eq("id", id);
  revalidatePath("/cohorts");
}

export async function addMember(formData: FormData) {
  const sb = createClient();
  const cohort_id = String(formData.get("cohort_id") || "");
  const participant_id = String(formData.get("participant_id") || "");
  if (cohort_id && participant_id) {
    await sb.from("cohort_members").insert({ cohort_id, participant_id });
    // reflect the cohort on the participant's approved nomination if present
    const training = String(formData.get("training_id") || "");
    if (training) {
      await sb.from("nominations").update({ cohort_id })
        .eq("participant_id", participant_id).eq("training_id", training).eq("status", "Approved");
    }
  }
  revalidatePath("/cohorts");
}

export async function removeMember(formData: FormData) {
  const sb = createClient();
  const cohort_id = String(formData.get("cohort_id") || "");
  const participant_id = String(formData.get("participant_id") || "");
  if (cohort_id && participant_id) {
    await sb.from("cohort_members").delete()
      .eq("cohort_id", cohort_id).eq("participant_id", participant_id);
  }
  revalidatePath("/cohorts");
}
