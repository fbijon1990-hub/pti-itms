"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createForm(formData: FormData) {
  const sb = createClient();
  const training_id = String(formData.get("training_id") || "") || null;
  const title = String(formData.get("title") || "").trim() || "Programme Evaluation";
  const { data } = await sb
    .from("evaluation_forms")
    .insert({ training_id, title })
    .select("id")
    .single();

  // Seed with a couple of sensible starter questions so the form is not empty.
  if (data) {
    await sb.from("evaluation_questions").insert([
      { form_id: data.id, prompt: "Overall, how would you rate this programme?", type: "rating", required: true, sort: 1 },
      { form_id: data.id, prompt: "What did you find most useful?", type: "paragraph", required: false, sort: 2 }
    ]);
  }
  revalidatePath("/evaluations");
  if (data) redirect(`/evaluations/${data.id}`);
}

export async function deleteForm(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  if (id) await sb.from("evaluation_forms").delete().eq("id", id);
  revalidatePath("/evaluations");
}

export async function toggleForm(formData: FormData) {
  const sb = createClient();
  const id = String(formData.get("id") || "");
  const open = String(formData.get("open") || "") === "1";
  if (id) await sb.from("evaluation_forms").update({ is_open: !open }).eq("id", id);
  revalidatePath("/evaluations");
}
