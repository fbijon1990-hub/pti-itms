"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleAttendance(formData: FormData) {
  const sb = createClient();
  const training_id = String(formData.get("training_id") || "");
  const participant_id = String(formData.get("participant_id") || "");
  const session_date = String(formData.get("session_date") || "");
  const currentlyPresent = String(formData.get("present") || "") === "1";
  if (!training_id || !participant_id || !session_date) return;

  if (currentlyPresent) {
    await sb.from("attendance").delete()
      .eq("training_id", training_id)
      .eq("participant_id", participant_id)
      .eq("session_date", session_date);
  } else {
    await sb.from("attendance").insert({
      training_id, participant_id, session_date,
      checked_at: new Date().toISOString().slice(11, 16),
      method: "Manual"
    });
  }
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}
