import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { fdate } from "@/lib/format";
import CopyLink from "@/components/CopyLink";
import { updateForm, addQuestion, updateQuestion, deleteQuestion, moveQuestion } from "./actions";

export const dynamic = "force-dynamic";

const TYPES: { v: string; l: string }[] = [
  { v: "rating", l: "Rating (1-5)" },
  { v: "text", l: "Short answer" },
  { v: "paragraph", l: "Paragraph" },
  { v: "choice", l: "Multiple choice" }
];
const typeLabel = (t: string) => TYPES.find((x) => x.v === t)?.l ?? t;

export default async function FormBuilderPage({
  params,
  searchParams
}: {
  params: { formId: string };
  searchParams: { editq?: string; add?: string };
}) {
  const sb = createClient();
  const formId = params.formId;

  const [{ data: form }, { data: questions }, { data: responses }, { data: answers }] = await Promise.all([
    sb.from("evaluation_forms").select("*").eq("id", formId).maybeSingle(),
    sb.from("evaluation_questions").select("*").eq("form_id", formId).order("sort"),
    sb.from("evaluation_responses").select("*").eq("form_id", formId).order("submitted_at", { ascending: false }),
    sb.from("evaluation_answers").select("*, evaluation_responses!inner(form_id)").eq("evaluation_responses.form_id", formId)
  ]);

  if (!form) {
    return (
      <div>
        <PageHeader title="Form not found" />
        <a href="/evaluations" className="btn-primary">Back to evaluations</a>
      </div>
    );
  }

  const qs = questions ?? [];
  const editing = searchParams.editq ? qs.find((q) => q.id === searchParams.editq) : null;
  const ans = answers ?? [];

  // per-question stats
  const stat = (qid: string, type: string) => {
    const a = ans.filter((x) => x.question_id === qid);
    if (type === "rating") {
      const nums = a.map((x) => Number(x.rating)).filter((n) => n > 0);
      const avg = nums.length ? (nums.reduce((s, n) => s + n, 0) / nums.length) : 0;
      return { count: nums.length, avg: +avg.toFixed(2), texts: [] as string[] };
    }
    return { count: a.length, avg: 0, texts: a.map((x) => x.answer_text).filter(Boolean) as string[] };
  };

  return (
    <div>
      <PageHeader
        title={form.title}
        subtitle={`${qs.length} question(s) · ${(responses ?? []).length} response(s)`}
        action={<a href="/evaluations" className="btn-ghost">Back</a>}
      />

      <Card className="mb-6 border-l-4 border-l-gold">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-green-ink">Share this form</p>
            <p className="mono text-xs text-info break-all">/evaluate/{form.id}</p>
            <p className="text-xs text-muted mt-1">{form.is_open ? "Open for responses" : "Closed - not accepting responses"}</p>
          </div>
          <div className="flex gap-2">
            <CopyLink path={`/evaluate/${form.id}`} />
            <a href={`/evaluate/${form.id}`} target="_blank" rel="noopener noreferrer" className="btn-primary py-1.5 px-3 text-xs">Open form</a>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT: builder */}
        <div className="space-y-6">
          <Card>
            <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Form details</h2>
            <form action={updateForm} className="space-y-3">
              <input type="hidden" name="id" value={form.id} />
              <div>
                <label className="label">Title</label>
                <input name="title" className="field" defaultValue={form.title} />
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <textarea name="description" rows={2} className="field" defaultValue={form.description ?? ""} />
              </div>
              <button className="btn-primary py-1.5 px-3 text-sm">Save details</button>
            </form>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="h-serif text-lg font-bold text-green-ink">Questions</h2>
            </div>

            {qs.length === 0 && <p className="text-sm text-muted mb-3">No questions yet.</p>}

            <ul className="space-y-2 mb-5">
              {qs.map((q, idx) => (
                <li key={q.id} className="border border-border rounded p-3">
                  {editing?.id === q.id ? (
                    <form action={updateQuestion} className="space-y-2">
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="form_id" value={form.id} />
                      <input name="prompt" className="field" defaultValue={q.prompt} required />
                      <div className="flex gap-2">
                        <select name="type" className="field" defaultValue={q.type}>
                          {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                        </select>
                        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                          <input type="checkbox" name="required" defaultChecked={q.required} className="accent-green" /> Required
                        </label>
                      </div>
                      <textarea name="options" rows={2} className="field" placeholder="Choices, one per line (for multiple choice)"
                        defaultValue={Array.isArray(q.options) ? q.options.join("\n") : ""} />
                      <div className="flex gap-2">
                        <button className="btn-primary py-1 px-3 text-xs">Save</button>
                        <a href={`/evaluations/${form.id}`} className="btn-ghost py-1 px-3 text-xs">Cancel</a>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {idx + 1}. {q.prompt}
                          {q.required && <span className="text-bad"> *</span>}
                        </p>
                        <p className="text-xs text-muted">{typeLabel(q.type)}
                          {q.type === "choice" && Array.isArray(q.options) && q.options.length > 0 && ` - ${q.options.join(", ")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <form action={moveQuestion} className="inline"><input type="hidden" name="id" value={q.id} /><input type="hidden" name="form_id" value={form.id} /><input type="hidden" name="dir" value="up" /><button className="text-muted px-1" title="Move up">&#9650;</button></form>
                        <form action={moveQuestion} className="inline"><input type="hidden" name="id" value={q.id} /><input type="hidden" name="form_id" value={form.id} /><input type="hidden" name="dir" value="down" /><button className="text-muted px-1" title="Move down">&#9660;</button></form>
                        <a href={`/evaluations/${form.id}?editq=${q.id}`} className="text-green underline text-xs px-1">Edit</a>
                        <form action={deleteQuestion} className="inline"><input type="hidden" name="id" value={q.id} /><input type="hidden" name="form_id" value={form.id} /><button className="text-bad underline text-xs px-1">Delete</button></form>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-green-ink mb-2">Add a question</h3>
              <form action={addQuestion} className="space-y-2">
                <input type="hidden" name="form_id" value={form.id} />
                <input name="prompt" className="field" placeholder="Question text" required />
                <div className="flex gap-2">
                  <select name="type" className="field" defaultValue="rating">
                    {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <input type="checkbox" name="required" defaultChecked className="accent-green" /> Required
                  </label>
                </div>
                <textarea name="options" rows={2} className="field" placeholder="Choices, one per line (only for multiple choice)" />
                <button className="btn-primary py-1.5 px-3 text-sm">Add question</button>
              </form>
            </div>
          </Card>
        </div>

        {/* RIGHT: results */}
        <div className="space-y-6">
          <Card>
            <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Results</h2>
            {(responses ?? []).length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No responses yet. Share the link to collect feedback.</p>
            ) : (
              <div className="space-y-5">
                {qs.map((q, idx) => {
                  const s = stat(q.id, q.type);
                  return (
                    <div key={q.id}>
                      <p className="text-sm font-medium mb-1">{idx + 1}. {q.prompt}</p>
                      {q.type === "rating" ? (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-green-soft overflow-hidden">
                            <div className="h-full bg-green" style={{ width: `${(s.avg / 5) * 100}%` }} />
                          </div>
                          <span className="text-sm font-bold text-green-ink mono">{s.avg || "-"}/5</span>
                          <span className="text-xs text-muted">({s.count})</span>
                        </div>
                      ) : (
                        <ul className="text-sm space-y-1">
                          {s.texts.length === 0 && <li className="text-muted text-xs">No answers.</li>}
                          {s.texts.slice(0, 20).map((t, i) => (
                            <li key={i} className="border-l-2 border-gold pl-2 text-muted">{t}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {(responses ?? []).length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-green-ink mb-2">Respondents ({(responses ?? []).length})</h3>
              <ul className="text-sm space-y-1">
                {(responses ?? []).map((r) => (
                  <li key={r.id} className="flex justify-between border-b border-border py-1">
                    <span>{r.respondent_name || "Anonymous"}</span>
                    <span className="text-xs text-muted">{fdate(String(r.submitted_at).slice(0, 10))}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
