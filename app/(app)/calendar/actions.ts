"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function daysBetween(start: string, end: string): number {
  if (!start || !end) return 1;
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export async function saveTraining(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "").trim();
  const start = String(formData.get("start_date") || "");
  const end = String(formData.get("end_date") || start);
  const row = {
    title: String(formData.get("title") || ""),
    category: String(formData.get("category") || ""),
    mode: String(formData.get("mode") || "In-person"),
    venue: String(formData.get("venue") || ""),
    start_date: start || null,
    end_date: end || null,
    status: String(formData.get("status") || "Planned"),
    capacity: Number(formData.get("capacity") || 20),
    days: daysBetween(start, end),
    objectives: String(formData.get("objectives") || "")
  };

  if (id) {
    await sb.from("trainings").update(row).eq("id", id);
  } else {
    const { data: created } = await sb.from("trainings").insert(row).select("id").single();
    // generate one session row per day
    if (created && start && end) {
      const sessions: { training_id: string; session_date: string }[] = [];
      const d = new Date(start);
      const last = new Date(end);
      while (d <= last) {
        sessions.push({ training_id: created.id, session_date: d.toISOString().slice(0, 10) });
        d.setDate(d.getDate() + 1);
      }
      if (sessions.length) await sb.from("training_sessions").insert(sessions);
    }
  }
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function deleteTraining(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("trainings").delete().eq("id", id);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}
