"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function nextNumber(sb: any) {
  const { data: inst } = await sb.from("institution").select("cert_prefix, next_cert").eq("id", "default").single();
  const prefix = inst?.cert_prefix ?? "PTI";
  const n = Number(inst?.next_cert ?? 1);
  const year = new Date().getFullYear();
  const number = `${prefix}/${year}/${String(n).padStart(4, "0")}`;
  await sb.from("institution").update({ next_cert: n + 1 }).eq("id", "default");
  return number;
}

export async function issueCertificate(formData: FormData) {
  const sb = createClient();
  const training_id = String(formData.get("training_id") || "");
  const participant_id = String(formData.get("participant_id") || "");
  if (!training_id || !participant_id) return;
  // guard against duplicates
  const { data: existing } = await sb.from("certificates").select("id")
    .eq("training_id", training_id).eq("participant_id", participant_id).maybeSingle();
  if (existing) return;
  const number = await nextNumber(sb);
  await sb.from("certificates").insert({
    training_id, participant_id, number, issued_on: new Date().toISOString().slice(0, 10)
  });
  revalidatePath("/certificates");
  revalidatePath("/dashboard");
}

export async function issueEligible(formData: FormData) {
  const sb = createClient();
  const training_id = String(formData.get("training_id") || "");
  if (!training_id) return;

  const [{ data: inst }, { data: sessions }, { data: approved }, { data: attend }, { data: post }, { data: certs }] =
    await Promise.all([
      sb.from("institution").select("attendance_min").eq("id", "default").single(),
      sb.from("training_sessions").select("id").eq("training_id", training_id),
      sb.from("nominations").select("participant_id").eq("training_id", training_id).eq("status", "Approved"),
      sb.from("attendance").select("participant_id").eq("training_id", training_id),
      sb.from("assessments").select("id, threshold, assessment_scores(participant_id, score)")
        .eq("training_id", training_id).eq("type", "Post").maybeSingle(),
      sb.from("certificates").select("participant_id").eq("training_id", training_id)
    ]);

  const min = Number(inst?.attendance_min ?? 70);
  const sessionCount = (sessions ?? []).length || 1;
  const already = new Set((certs ?? []).map((c: any) => c.participant_id));

  const presentCount: Record<string, number> = {};
  (attend ?? []).forEach((a: any) => { presentCount[a.participant_id] = (presentCount[a.participant_id] || 0) + 1; });

  const passed = new Set<string>();
  const threshold = Number(post?.threshold ?? 0);
  (post?.assessment_scores ?? []).forEach((s: any) => {
    if (Number(s.score) >= threshold) passed.add(s.participant_id);
  });

  for (const a of approved ?? []) {
    const pid = a.participant_id;
    if (already.has(pid)) continue;
    const rate = ((presentCount[pid] || 0) / sessionCount) * 100;
    const eligible = rate >= min && (post ? passed.has(pid) : true);
    if (!eligible) continue;
    const number = await nextNumber(sb);
    await sb.from("certificates").insert({
      training_id, participant_id: pid, number, issued_on: new Date().toISOString().slice(0, 10)
    });
  }
  revalidatePath("/certificates");
  revalidatePath("/dashboard");
}

export async function revokeCertificate(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("certificates").delete().eq("id", id);
  revalidatePath("/certificates");
  revalidatePath("/dashboard");
}
