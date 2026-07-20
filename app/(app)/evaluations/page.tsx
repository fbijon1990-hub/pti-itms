import { PageHeader, Card } from "@/components/ui";
import { getTrainings } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { fdate } from "@/lib/format";
import CopyLink from "@/components/CopyLink";
import { createForm, deleteForm, toggleForm } from "./actions";

export const dynamic = "force-dynamic";

export default async function EvaluationsPage({ searchParams }: { searchParams: { t?: string } }) {
  const trainings = await getTrainings();
  const active = searchParams.t || trainings[0]?.id;

  const sb = createClient();
  const { data: forms } = await sb
    .from("evaluation_forms")
    .select("*, evaluation_responses(count), evaluation_questions(count)")
    .eq("training_id", active)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Participant Evaluations"
        subtitle="Build custom evaluation forms and share a link. No login needed for participants."
      />

      <div className="flex gap-2 flex-wrap mb-5">
        {trainings.map((t) => (
          <a key={t.id} href={`/evaluations?t=${t.id}`}
            className={`btn ${t.id === active ? "btn-primary" : "btn-ghost"} py-1.5 px-3 text-xs`}>
            {t.title}
          </a>
        ))}
      </div>

      {active && (
        <Card className="mb-6">
          <form action={createForm} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="training_id" value={active} />
            <div className="flex-1 min-w-[240px]">
              <label className="label">New form title</label>
              <input name="title" className="field" defaultValue="Programme Evaluation" />
            </div>
            <button className="btn-primary">+ Create form</button>
          </form>
        </Card>
      )}

      {!forms || forms.length === 0 ? (
        <Card><p className="text-sm text-muted text-center py-6">No forms yet. Create one above to start adding questions.</p></Card>
      ) : (
        <div className="space-y-4">
          {forms.map((f: any) => {
            const responses = f.evaluation_responses?.[0]?.count ?? 0;
            const questions = f.evaluation_questions?.[0]?.count ?? 0;
            return (
              <Card key={f.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="h-serif text-lg font-bold text-green-ink">{f.title}</h2>
                      <span className={f.is_open ? "badge-ok" : "badge-bad"}>{f.is_open ? "Open" : "Closed"}</span>
                    </div>
                    <p className="text-sm text-muted mt-1">
                      {questions} question(s) &middot; {responses} response(s) &middot; created {fdate(f.created_at?.slice(0,10))}
                    </p>
                    <p className="mono text-xs text-info mt-1 break-all">/evaluate/{f.id}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`/evaluations/${f.id}`} className="btn-primary py-1.5 px-3 text-xs">Edit and results</a>
                    <CopyLink path={`/evaluate/${f.id}`} label="Copy link" />
                    <a href={`/evaluate/${f.id}`} target="_blank" rel="noopener noreferrer" className="btn-ghost py-1.5 px-3 text-xs">Open</a>
                    <form action={toggleForm} className="inline">
                      <input type="hidden" name="id" value={f.id} />
                      <input type="hidden" name="open" value={f.is_open ? "1" : "0"} />
                      <button className="btn-ghost py-1.5 px-3 text-xs">{f.is_open ? "Close" : "Reopen"}</button>
                    </form>
                    <form action={deleteForm} className="inline">
                      <input type="hidden" name="id" value={f.id} />
                      <button className="text-bad underline text-xs">Delete</button>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
