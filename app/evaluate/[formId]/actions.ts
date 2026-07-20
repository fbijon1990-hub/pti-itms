"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Anonymous submission via the security-definer RPC. Builds the answers
// array from the form's own question list, so nothing is trusted from the
// client beyond field values.
export async function submitResponse(formData: FormData) {
  const fid = String(formData.get("form_id") || "");
  if (!fid) redirect(`/evaluate/${fid}?error=1`);

  const sb = createClient();
  const { data: form } = await sb.rpc("get_public_form", { fid });
  if (!form) redirect(`/evaluate/${fid}?error=1`);

  const questions: any[] = form.questions ?? [];
  const answers = questions.map((q) => {
    const raw = formData.get(`q_${q.id}`);
    if (q.type === "rating") {
      return { question_id: q.id, rating: raw ? String(raw) : "", answer_text: "" };
    }
    return { question_id: q.id, rating: "", answer_text: raw ? String(raw) : "" };
  });

  const rname = String(formData.get("respondent_name") || "");
  const { error } = await sb.rpc("submit_public_response", { fid, rname, answers });
  if (error) redirect(`/evaluate/${fid}?error=1`);
  redirect(`/evaluate/${fid}?done=1`);
}
