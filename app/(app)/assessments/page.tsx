import { PageHeader, Card, StatCard } from "@/components/ui";
import { getTrainings, assessmentAvg, trainingMetrics, getParticipants } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { saveAssessment, deleteAssessment, saveScore, deleteScore } from "./actions";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage({ searchParams }: { searchParams: { t?: string; new?: string } }) {
  const trainings = await getTrainings();
  const active = searchParams.t || trainings.find((t) => t.status === "Completed")?.id || trainings[0]?.id;

  const sb = createClient();
  const participants = await getParticipants();
  const pMap = new Map(participants.map((p) => [p.id, p.name]));

  const [pre, post, metrics, { data: assessments }, { data: approved }] = await Promise.all([
    active ? assessmentAvg(active, "Pre") : Promise.resolve(null),
    active ? assessmentAvg(active, "Post") : Promise.resolve(null),
    active ? trainingMetrics(active) : Promise.resolve(null),
    sb.from("assessments").select("*, assessment_scores(*)").eq("training_id", active),
    sb.from("nominations").select("participant_id").eq("training_id", active).eq("status", "Approved")
  ]);
  const enrolled = (approved ?? []).map((a) => a.participant_id);

  return (
    <div>
      <PageHeader
        title="Pre / Post Assessments"
        subtitle="Knowledge measurement and learning gain"
        action={
          searchParams.new
            ? <a href={`/assessments?t=${active}`} className="btn-ghost">Close</a>
            : <a href={`/assessments?t=${active}&new=1`} className="btn-primary">+ New assessment</a>
        }
      />
      <div className="flex gap-2 flex-wrap mb-4">
        {trainings.map((t) => (
          <a key={t.id} href={`/assessments?t=${t.id}`}
            className={`btn ${t.id === active ? "btn-primary" : "btn-ghost"} py-1.5 px-3 text-xs`}>
            {t.title}
          </a>
        ))}
      </div>

      {searchParams.new && (
        <Card className="mb-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-3">New assessment</h2>
          <form action={saveAssessment} className="grid md:grid-cols-5 gap-3 items-end">
            <input type="hidden" name="training_id" value={active} />
            <div>
              <label className="label">Type</label>
              <select name="type" className="field"><option>Pre</option><option>Post</option></select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Title</label>
              <input name="title" required className="field" placeholder="Oversight Pre-Assessment" />
            </div>
            <div>
              <label className="label">Max score</label>
              <input name="max_score" type="number" className="field" defaultValue={20} />
            </div>
            <div>
              <label className="label">Pass mark</label>
              <input name="threshold" type="number" className="field" defaultValue={12} />
            </div>
            <div className="md:col-span-5">
              <button className="btn-primary">Create assessment</button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Pre-assessment" value={pre ? `${pre.pct}%` : "-"} hint={pre ? `avg ${pre.avg.toFixed(1)}/${pre.max}` : undefined} />
        <StatCard label="Post-assessment" value={post ? `${post.pct}%` : "-"} hint={post ? `avg ${post.avg.toFixed(1)}/${post.max}` : undefined} />
        <StatCard label="Knowledge gain" value={metrics?.gain === null || metrics?.gain === undefined ? "-" : `+${metrics.gain}%`} />
      </div>

      {(assessments ?? []).length === 0 && (
        <Card><p className="text-sm text-muted py-4 text-center">No assessments for this programme yet.</p></Card>
      )}

      {(assessments ?? []).map((a: any) => {
        const scored = new Set((a.assessment_scores ?? []).map((s: any) => s.participant_id));
        const unscored = enrolled.filter((pid) => !scored.has(pid));
        return (
          <Card key={a.id} className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <h2 className="h-serif text-lg font-bold text-green-ink">{a.title}</h2>
              <form action={deleteAssessment}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-bad underline text-xs">Delete</button>
              </form>
            </div>
            <p className="text-xs text-muted mb-3">{a.type} - pass mark {a.threshold}/{a.max_score}</p>
            <table className="ledger mb-3">
              <thead><tr><th>Participant</th><th className="text-right">Score</th><th>Result</th><th></th></tr></thead>
              <tbody>
                {(a.assessment_scores ?? []).map((s: any) => (
                  <tr key={s.id}>
                    <td>{pMap.get(s.participant_id) ?? s.participant_id}</td>
                    <td className="text-right mono">{s.score}/{a.max_score}</td>
                    <td>{Number(s.score) >= a.threshold ? <span className="badge-ok">Pass</span> : <span className="badge-bad">Below</span>}</td>
                    <td className="text-right">
                      <form action={deleteScore} className="inline">
                        <input type="hidden" name="id" value={s.id} />
                        <button className="text-bad underline text-xs">Remove</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {(a.assessment_scores ?? []).length === 0 && (
                  <tr><td colSpan={4} className="text-center text-muted py-2">No scores entered.</td></tr>
                )}
              </tbody>
            </table>
            {unscored.length > 0 && (
              <form action={saveScore} className="flex gap-2 items-end">
                <input type="hidden" name="assessment_id" value={a.id} />
                <div className="flex-1">
                  <label className="label">Enter score</label>
                  <select name="participant_id" required className="field">
                    <option value="">Select participant...</option>
                    {unscored.map((pid) => <option key={pid} value={pid}>{pMap.get(pid) ?? pid}</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="label">Score (/{a.max_score})</label>
                  <input name="score" type="number" step="0.5" required className="field" />
                </div>
                <button className="btn-ghost">Save</button>
              </form>
            )}
          </Card>
        );
      })}
    </div>
  );
}
