import { PageHeader, Card, StatCard } from "@/components/ui";
import { getTrainings, trainingMetrics, getParticipants } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { saveEvaluation, deleteEvaluation } from "./actions";

export const dynamic = "force-dynamic";

const DIMS = ["content", "facilitation", "materials", "logistics", "overall"] as const;

export default async function EvaluationsPage({ searchParams }: { searchParams: { t?: string; new?: string } }) {
  const trainings = await getTrainings();
  const active = searchParams.t || trainings.find((t) => t.status === "Completed")?.id || trainings[0]?.id;

  const sb = createClient();
  const participants = await getParticipants();
  const pMap = new Map(participants.map((p) => [p.id, p.name]));

  const [metrics, { data: evals }, { data: approved }] = await Promise.all([
    active ? trainingMetrics(active) : Promise.resolve(null),
    sb.from("evaluations").select("*").eq("training_id", active),
    sb.from("nominations").select("participant_id").eq("training_id", active).eq("status", "Approved")
  ]);
  const e = metrics?.evaluation;
  const enrolled = (approved ?? []).map((a) => a.participant_id);

  return (
    <div>
      <PageHeader
        title="Participant Evaluations"
        subtitle="End-of-programme feedback (1-5 scale)"
        action={
          searchParams.new
            ? <a href={`/evaluations?t=${active}`} className="btn-ghost">Close</a>
            : <a href={`/evaluations?t=${active}&new=1`} className="btn-primary">+ Add evaluation</a>
        }
      />
      <div className="flex gap-2 flex-wrap mb-4">
        {trainings.map((t) => (
          <a key={t.id} href={`/evaluations?t=${t.id}`}
            className={`btn ${t.id === active ? "btn-primary" : "btn-ghost"} py-1.5 px-3 text-xs`}>
            {t.title}
          </a>
        ))}
      </div>

      {searchParams.new && (
        <Card className="mb-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-3">New evaluation</h2>
          <form action={saveEvaluation} className="space-y-4">
            <input type="hidden" name="training_id" value={active} />
            <div className="grid md:grid-cols-6 gap-3">
              <div className="md:col-span-1">
                <label className="label">Participant</label>
                <select name="participant_id" required className="field">
                  <option value="">Select...</option>
                  {enrolled.map((pid) => <option key={pid} value={pid}>{pMap.get(pid) ?? pid}</option>)}
                </select>
              </div>
              {DIMS.map((d) => (
                <div key={d}>
                  <label className="label">{d}</label>
                  <select name={d} required className="field" defaultValue="5">
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div>
              <label className="label">Comment</label>
              <input name="comment" className="field" placeholder="Optional" />
            </div>
            <button className="btn-primary">Save evaluation</button>
          </form>
        </Card>
      )}

      {e ? (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <StatCard label="Content" value={`${e.content}`} />
          <StatCard label="Facilitation" value={`${e.facilitation}`} />
          <StatCard label="Materials" value={`${e.materials}`} />
          <StatCard label="Logistics" value={`${e.logistics}`} />
          <StatCard label="Overall" value={`${e.overall}`} />
          <StatCard label="Mean" value={`${e.mean}`} hint={`${e.n} responses`} />
        </div>
      ) : (
        <Card className="mb-6"><p className="text-sm text-muted text-center py-4">No evaluations recorded.</p></Card>
      )}

      {evals && evals.length > 0 && (
        <Card>
          <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Responses</h2>
          <table className="ledger">
            <thead>
              <tr><th>Participant</th>{DIMS.map((d) => <th key={d} className="text-center capitalize">{d.slice(0,4)}</th>)}<th>Comment</th><th></th></tr>
            </thead>
            <tbody>
              {evals.map((v) => (
                <tr key={v.id}>
                  <td className="font-medium">{pMap.get(v.participant_id) ?? "Participant"}</td>
                  {DIMS.map((d) => <td key={d} className="text-center mono">{(v as any)[d]}</td>)}
                  <td className="text-xs text-muted">{v.comment}</td>
                  <td className="text-right">
                    <form action={deleteEvaluation} className="inline">
                      <input type="hidden" name="id" value={v.id} />
                      <button className="text-bad underline text-xs">Remove</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
