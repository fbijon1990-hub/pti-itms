import { PageHeader, Card, StatCard } from "@/components/ui";
import { getTrainings, trainingMetrics } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { getParticipants } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EvaluationsPage({ searchParams }: { searchParams: { t?: string } }) {
  const trainings = await getTrainings();
  const active = searchParams.t || trainings.find((t) => t.status === "Completed")?.id || trainings[0]?.id;

  const sb = createClient();
  const participants = await getParticipants();
  const pMap = new Map(participants.map((p) => [p.id, p.name]));

  const [metrics, { data: evals }] = await Promise.all([
    active ? trainingMetrics(active) : Promise.resolve(null),
    sb.from("evaluations").select("*").eq("training_id", active)
  ]);
  const e = metrics?.evaluation;

  return (
    <div>
      <PageHeader title="Participant Evaluations" subtitle="End-of-programme feedback (1-5 scale)" />
      <div className="flex gap-2 flex-wrap mb-4">
        {trainings.map((t) => (
          <a key={t.id} href={`/evaluations?t=${t.id}`}
            className={`btn ${t.id === active ? "btn-primary" : "btn-ghost"} py-1.5 px-3 text-xs`}>
            {t.title}
          </a>
        ))}
      </div>

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
          <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Comments</h2>
          <ul className="space-y-2 text-sm">
            {evals.filter((v) => v.comment).map((v) => (
              <li key={v.id} className="border-l-2 border-gold pl-3">
                <span className="text-muted text-xs">{pMap.get(v.participant_id) ?? "Participant"}:</span> {v.comment}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
