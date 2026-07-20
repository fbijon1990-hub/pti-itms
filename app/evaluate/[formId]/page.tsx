import { createClient } from "@/lib/supabase/server";
import { submitResponse } from "./actions";

export const dynamic = "force-dynamic";

const SCALE = [
  { v: 5, l: "Excellent" },
  { v: 4, l: "Very good" },
  { v: 3, l: "Good" },
  { v: 2, l: "Fair" },
  { v: 1, l: "Poor" }
];

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-paper py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-full bg-gold grid place-items-center text-green-ink font-bold h-serif">PTI</div>
          <div>
            <p className="font-bold text-green-ink h-serif leading-tight">Parliamentary Training Institute</p>
            <p className="text-xs text-muted">Parliament of Ghana</p>
          </div>
        </div>
        {children}
        <p className="text-center text-xs text-faint mt-6">
          Your response is confidential and helps us improve future programmes.
        </p>
      </div>
    </main>
  );
}

export default async function PublicFormPage({
  params,
  searchParams
}: {
  params: { formId: string };
  searchParams: { done?: string; error?: string };
}) {
  const sb = createClient();
  const { data: form } = await sb.rpc("get_public_form", { fid: params.formId });

  if (!form) {
    return (
      <Shell>
        <div className="card card-pad text-center">
          <h1 className="page-title mb-2">Form not found</h1>
          <p className="text-sm text-muted">This link is invalid or the form has been removed.</p>
        </div>
      </Shell>
    );
  }

  if (searchParams.done) {
    return (
      <Shell>
        <div className="card card-pad text-center py-10">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-ok-soft grid place-items-center text-ok text-2xl">&#10003;</div>
          <h1 className="page-title mb-2">Thank you</h1>
          <p className="text-sm text-muted">Your feedback on <span className="font-semibold">{form.title}</span> has been received.</p>
        </div>
      </Shell>
    );
  }

  if (form.is_open === false) {
    return (
      <Shell>
        <div className="card card-pad text-center">
          <h1 className="page-title mb-2">{form.title}</h1>
          <p className="text-sm text-muted">This form is closed and is no longer accepting responses.</p>
        </div>
      </Shell>
    );
  }

  const questions: any[] = form.questions ?? [];

  return (
    <Shell>
      <div className="card card-pad">
        <h1 className="page-title mb-1">{form.title}</h1>
        {form.training_title && <p className="text-sm text-muted">{form.training_title}</p>}
        {form.description && <p className="text-sm text-ink mt-2">{form.description}</p>}

        {searchParams.error && (
          <p className="badge-bad w-full justify-center my-4 py-2">Something went wrong. Please try again.</p>
        )}

        <form action={submitResponse} className="space-y-6 mt-6">
          <input type="hidden" name="form_id" value={form.id} />

          {questions.map((q, idx) => (
            <div key={q.id}>
              <label className="block font-semibold text-ink mb-2">
                {idx + 1}. {q.prompt}{q.required && <span className="text-bad"> *</span>}
              </label>

              {q.type === "rating" && (
                <div className="flex flex-wrap gap-2">
                  {SCALE.map((s) => (
                    <label key={s.v} className="flex items-center gap-2 border border-border-strong rounded px-3 py-2 text-sm cursor-pointer hover:bg-green-soft has-[:checked]:bg-green has-[:checked]:text-white has-[:checked]:border-green">
                      <input type="radio" name={`q_${q.id}`} value={s.v} required={q.required} className="accent-green" />
                      {s.v} - {s.l}
                    </label>
                  ))}
                </div>
              )}

              {q.type === "text" && (
                <input name={`q_${q.id}`} required={q.required} className="field" />
              )}

              {q.type === "paragraph" && (
                <textarea name={`q_${q.id}`} required={q.required} rows={4} className="field" />
              )}

              {q.type === "choice" && (
                <div className="space-y-2">
                  {(Array.isArray(q.options) ? q.options : []).map((opt: string, i: number) => (
                    <label key={i} className="flex items-center gap-2 border border-border-strong rounded px-3 py-2 text-sm cursor-pointer hover:bg-green-soft has-[:checked]:bg-green has-[:checked]:text-white has-[:checked]:border-green">
                      <input type="radio" name={`q_${q.id}`} value={opt} required={q.required} className="accent-green" />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div>
            <label className="block font-semibold text-ink mb-2">Your name (optional)</label>
            <input name="respondent_name" className="field" placeholder="Leave blank to remain anonymous" />
          </div>

          <button className="btn-primary w-full py-3 text-base">Submit</button>
        </form>
      </div>
    </Shell>
  );
}
