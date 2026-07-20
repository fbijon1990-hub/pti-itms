"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createNomination(formData: FormData) {
  const sb = createClient();
  await sb.from("nominations").insert({
    participant_id: String(formData.get("participant_id") || ""),
    training_id: String(formData.get("training_id") || ""),
    nominated_by: String(formData.get("nominated_by") || ""),
    justification: String(formData.get("justification") || ""),
    status: "Pending"
  });
  revalidatePath("/nominations");
}

export async function setStatus(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "Pending");
  if (!id) return;

  await sb.from("nominations").update({ status }).eq("id", id);

  // On approval, auto-generate an invitation record (mirrors standalone app).
  if (status === "Approved") {
    const { data: nom } = await sb
      .from("nominations")
      .select("participant_id, training_id")
      .eq("id", id)
      .single();
    if (nom) {
      const { data: t } = await sb.from("trainings").select("title").eq("id", nom.training_id).single();
      await sb.from("notifications").insert({
        type: "Invitation",
        training_id: nom.training_id,
        participant_id: nom.participant_id,
        subject: `Invitation: ${t?.title ?? "Training programme"}`,
        status: "Sent"
      });
    }
  }
  revalidatePath("/nominations");
  revalidatePath("/invitations");
  revalidatePath("/dashboard");
}
