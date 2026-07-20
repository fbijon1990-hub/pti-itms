"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendNotification(formData: FormData) {
  const sb = createClient();
  const training_id = String(formData.get("training_id") || "") || null;
  const participant_id = String(formData.get("participant_id") || "") || null;
  const type = String(formData.get("type") || "Invitation");
  let subject = String(formData.get("subject") || "");

  if (!subject && training_id) {
    const { data: t } = await sb.from("trainings").select("title").eq("id", training_id).single();
    subject = `${type}: ${t?.title ?? "Training programme"}`;
  }

  // If no specific participant chosen, send to every approved participant of the programme.
  if (!participant_id && training_id) {
    const { data: approved } = await sb.from("nominations")
      .select("participant_id").eq("training_id", training_id).eq("status", "Approved");
    const rows = (approved ?? []).map((a) => ({
      type, training_id, participant_id: a.participant_id, subject, status: "Sent"
    }));
    if (rows.length) await sb.from("notifications").insert(rows);
  } else {
    await sb.from("notifications").insert({ type, training_id, participant_id, subject, status: "Sent" });
  }
  revalidatePath("/invitations");
}

export async function deleteNotification(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("notifications").delete().eq("id", id);
  revalidatePath("/invitations");
}
