"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function opts(raw: string): string[] {
  return raw.split("\n").map((s) => s.trim()).filter(Boolean);
}

export async function updateForm(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  await sb.from("evaluation_forms").update({
    title: String(formData.get("title") || "Programme Evaluation"),
    description: String(formData.get("description") || "") || null
  }).eq("id", id);
  revalidatePath(`/evaluations/${id}`);
}

export async function addQuestion(formData: FormData) {
  const sb = createClient();
  const form_id = String(formData.get("form_id") || "");
  const type = String(formData.get("type") || "rating");
  const { data: last } = await sb
    .from("evaluation_questions")
    .select("sort")
    .eq("form_id", form_id)
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort = (last?.sort ?? 0) + 1;

  await sb.from("evaluation_questions").insert({
    form_id,
    prompt: String(formData.get("prompt") || "").trim(),
    type,
    required: String(formData.get("required") || "") === "on",
    options: type === "choice" ? opts(String(formData.get("options") || "")) : [],
    sort
  });
  revalidatePath(`/evaluations/${form_id}`);
}

export async function updateQuestion(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  const form_id = String(formData.get("form_id") || "");
  const type = String(formData.get("type") || "rating");
  await sb.from("evaluation_questions").update({
    prompt: String(formData.get("prompt") || "").trim(),
    type,
    required: String(formData.get("required") || "") === "on",
    options: type === "choice" ? opts(String(formData.get("options") || "")) : []
  }).eq("id", id);
  revalidatePath(`/evaluations/${form_id}`);
}

export async function deleteQuestion(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  const form_id = String(formData.get("form_id") || "");
  if (id) await sb.from("evaluation_questions").delete().eq("id", id);
  revalidatePath(`/evaluations/${form_id}`);
}

// Swap sort order with the neighbouring question in the given direction.
export async function moveQuestion(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  const form_id = String(formData.get("form_id") || "");
  const dir = String(formData.get("dir") || "up");

  const { data: qs } = await sb
    .from("evaluation_questions")
    .select("id, sort")
    .eq("form_id", form_id)
    .order("sort", { ascending: true });
  if (!qs) return;

  const i = qs.findIndex((q) => q.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= qs.length) return;

  await sb.from("evaluation_questions").update({ sort: qs[j].sort }).eq("id", qs[i].id);
  await sb.from("evaluation_questions").update({ sort: qs[i].sort }).eq("id", qs[j].id);
  revalidatePath(`/evaluations/${form_id}`);
}
