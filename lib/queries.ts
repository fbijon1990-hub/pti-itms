import { createClient } from "@/lib/supabase/server";
import { pct } from "@/lib/format";

// Centralised server-side data access. Each function creates a request-scoped
// client so it is safe to call from any Server Component.

export async function getInstitution() {
  const sb = createClient();
  const { data } = await sb.from("institution").select("*").eq("id", "default").single();
  return data;
}

export async function getTrainings() {
  const sb = createClient();
  const { data } = await sb.from("trainings").select("*").order("start_date", { ascending: true });
  return data ?? [];
}

export async function getParticipants() {
  const sb = createClient();
  const { data } = await sb.from("participants").select("*").order("name");
  return data ?? [];
}

export async function getFacilitators() {
  const sb = createClient();
  const { data } = await sb.from("facilitators").select("*").order("name");
  return data ?? [];
}

export async function getCompetencies() {
  const sb = createClient();
  const { data } = await sb.from("competencies").select("*").order("area");
  return data ?? [];
}

// ---- Derived metrics for a single training (mirrors the standalone app) ----

export async function trainingMetrics(trainingId: string) {
  const sb = createClient();

  const [{ count: sessionCount }, approved, attendanceRows, pre, post, evals] = await Promise.all([
    sb.from("training_sessions").select("id", { count: "exact", head: true }).eq("training_id", trainingId),
    sb.from("nominations").select("participant_id").eq("training_id", trainingId).eq("status", "Approved"),
    sb.from("attendance").select("id").eq("training_id", trainingId),
    assessmentAvg(trainingId, "Pre"),
    assessmentAvg(trainingId, "Post"),
    sb.from("evaluations").select("*").eq("training_id", trainingId)
  ]);

  const enrolled = approved.data?.length ?? 0;
  const sessions = sessionCount || 1;
  const present = attendanceRows.data?.length ?? 0;
  const attendanceRate = enrolled ? pct(present, enrolled * sessions) : 0;

  const gain = pre && post ? post.pct - pre.pct : null;

  let evaluation: null | Record<string, number> = null;
  const rows = evals.data ?? [];
  if (rows.length) {
    const dims = ["content", "facilitation", "materials", "logistics", "overall"] as const;
    const out: Record<string, number> = {};
    dims.forEach((d) => {
      out[d] = +(rows.reduce((s, e) => s + (Number((e as any)[d]) || 0), 0) / rows.length).toFixed(2);
    });
    out.mean = +((out.content + out.facilitation + out.materials + out.logistics + out.overall) / 5).toFixed(2);
    out.n = rows.length;
    evaluation = out;
  }

  return { enrolled, attendanceRate, pre, post, gain, evaluation };
}

export async function assessmentAvg(trainingId: string, type: "Pre" | "Post") {
  const sb = createClient();
  const { data: a } = await sb
    .from("assessments")
    .select("id, max_score")
    .eq("training_id", trainingId)
    .eq("type", type)
    .maybeSingle();
  if (!a) return null;
  const { data: scores } = await sb.from("assessment_scores").select("score").eq("assessment_id", a.id);
  if (!scores || !scores.length) return null;
  const avg = scores.reduce((s, x) => s + Number(x.score), 0) / scores.length;
  return { avg, pct: pct(avg, a.max_score), max: a.max_score };
}

export async function budgetTotals(budgetId: string | null) {
  if (!budgetId) return { budget: 0, actual: 0, variance: 0 };
  const sb = createClient();
  const { data } = await sb.from("budget_lines").select("budget, actual").eq("budget_id", budgetId);
  const budget = (data ?? []).reduce((s, l) => s + Number(l.budget || 0), 0);
  const actual = (data ?? []).reduce((s, l) => s + Number(l.actual || 0), 0);
  return { budget, actual, variance: budget - actual };
}

// ---- Portfolio-level dashboard aggregates ----

export async function dashboardStats() {
  const sb = createClient();
  const [trainings, participants, certs, facilitators, nominations] = await Promise.all([
    sb.from("trainings").select("id, status, start_date, title, category, mode, venue, end_date"),
    sb.from("participants").select("id", { count: "exact", head: true }),
    sb.from("certificates").select("id", { count: "exact", head: true }),
    sb.from("facilitators").select("id", { count: "exact", head: true }),
    sb.from("nominations").select("id", { count: "exact", head: true }).eq("status", "Pending")
  ]);

  const t = trainings.data ?? [];
  const byStatus = { Planned: 0, Open: 0, Completed: 0, Cancelled: 0 } as Record<string, number>;
  t.forEach((x) => { byStatus[x.status] = (byStatus[x.status] || 0) + 1; });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = t
    .filter((x) => (x.start_date || "") >= today && x.status !== "Cancelled")
    .sort((a, b) => (a.start_date || "").localeCompare(b.start_date || ""))
    .slice(0, 5);

  return {
    trainingCount: t.length,
    byStatus,
    participantCount: participants.count ?? 0,
    certCount: certs.count ?? 0,
    facilitatorCount: facilitators.count ?? 0,
    pendingNominations: nominations.count ?? 0,
    upcoming
  };
}
