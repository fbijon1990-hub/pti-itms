import { PageHeader, Card, StatCard } from "@/components/ui";
import { getTrainings, assessmentAvg, trainingMetrics } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { getParticipants } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage({ searchParams }: { searchParams: { t?: string } }) {
  const trainings = await getTrainings();
  const active = searchParams.t || trainings.find((t) => t.status === "Completed")?.id || trainings[0]?.id;

  const sb = createClient();
  const participants = await getParticipants();
  const pMap = new Map(participants.map((p) => [p.id, p.name]));

  const [pre, post, metrics, { data: assessments }] = await Promise.all([
    active ? assessmentAvg(active, "Pre") : Promise.resolve(null),
    active ? assessmentAvg(active, "Post") : Promise.resolve(null),
    active ? trainingMetrics(active) : Promise.resolve(null),
    sb.from("assessments").select("*, assessment_scores(*)").eq("training_id", active)
  ]);

  return (
    <div>
      <PageHeader title="Pre / Post Assessments" subtitle="Knowledge measurement and learning gain" />
      <div className="flex gap-2 flex-wrap mb-4">
        {trainings.map((t) => (
          <a key={t.id} href={`/assessments?t=${t.id}`}
            className={`btn ${t.id === active ? "btn-primary" : "btn-ghost"} py-1.5 px-3 text-xs`}>
            {t.title}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Pre-assessment" value={pre ? `${pre.pct}%` : "-"} hint={pre ? `avg ${pre.avg.toFixed(1)}/${pre.max}` : undefined} />
        <StatCard label="Post-assessment" value={post ? `${post.pct}%` : "-"} hint={post ? `avg ${post.avg.toFixed(1)}/${post.max}` : undefined} />
        <StatCard label="Knowledge gain" value={metrics?.gain === null || metrics?.gain === undefined ? "-" : `+${metrics.gain}%`} />
      </div>

      {(assessments ?? []).map((a: any) => (
        <Card key={a.id} className="mb-4">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-1">{a.title}</h2>
          <p className="text-xs text-muted mb-3">{a.type} - pass mark {a.threshold}/{a.max_score}</p>
          <table className="ledger">
            <thead><tr><th>Participant</th><th className="text-right">Score</th><th>Result</th></tr></thead>
            <tbody>
              {(a.assessment_scores ?? []).map((s: any) => (
                <tr key={s.id}>
                  <td>{pMap.get(s.participant_id) ?? s.participant_id}</td>
                  <td className="text-right mono">{s.score}/{a.max_score}</td>
                  <td>{Number(s.score) >= a.threshold ? <span className="badge-ok">Pass</span> : <span className="badge-bad">Below</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
}
