"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveAssessment(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "").trim();
  const row = {
    training_id: String(formData.get("training_id") || ""),
    type: String(formData.get("type") || "Pre"),
    title: String(formData.get("title") || ""),
    max_score: Number(formData.get("max_score") || 20),
    threshold: Number(formData.get("threshold") || 12)
  };
  if (id) await sb.from("assessments").update(row).eq("id", id);
  else await sb.from("assessments").insert(row);
  revalidatePath("/assessments");
  revalidatePath("/dashboard");
}

export async function deleteAssessment(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("assessments").delete().eq("id", id);
  revalidatePath("/assessments");
  revalidatePath("/dashboard");
}

export async function saveScore(formData: FormData) {
  const sb = createClient();
  const assessment_id = String(formData.get("assessment_id") || "");
  const participant_id = String(formData.get("participant_id") || "");
  const score = Number(formData.get("score") || 0);
  if (assessment_id && participant_id) {
    await sb.from("assessment_scores").upsert(
      { assessment_id, participant_id, score },
      { onConflict: "assessment_id,participant_id" }
    );
  }
  revalidatePath("/assessments");
  revalidatePath("/dashboard");
}

export async function deleteScore(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("assessment_scores").delete().eq("id", id);
  revalidatePath("/assessments");
  revalidatePath("/dashboard");
}
