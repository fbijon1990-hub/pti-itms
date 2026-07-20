import { PageHeader, Card, StatCard, StatusBadge } from "@/components/ui";
import { getTrainings, trainingMetrics, budgetTotals } from "@/lib/queries";
import { fdaterange, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }: { searchParams: { t?: string } }) {
  const trainings = await getTrainings();
  const active = searchParams.t || trainings.find((t) => t.status === "Completed")?.id || trainings[0]?.id;
  const t = trainings.find((x) => x.id === active);

  const [m, bt] = t
    ? await Promise.all([trainingMetrics(t.id), budgetTotals(t.budget_id)])
    : [null, null];

  return (
    <div>
      <PageHeader title="Training Reports" subtitle="Auto-compiled completion report per programme" />
      <div className="flex gap-2 flex-wrap mb-4">
        {trainings.map((x) => (
          <a key={x.id} href={`/reports?t=${x.id}`}
            className={`btn ${x.id === active ? "btn-primary" : "btn-ghost"} py-1.5 px-3 text-xs`}>
            {x.title}
          </a>
        ))}
      </div>

      {t && m && (
        <Card>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="h-serif text-xl font-bold text-green-ink">{t.title}</h2>
              <p className="text-sm text-muted">{fdaterange(t.start_date, t.end_date)} - {t.venue}</p>
            </div>
            <StatusBadge status={t.status} />
          </div>

          {t.objectives && <p className="text-sm mb-5 leading-relaxed">{t.objectives}</p>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Enrolled" value={m.enrolled} />
            <StatCard label="Attendance" value={`${m.attendanceRate}%`} />
            <StatCard label="Knowledge gain" value={m.gain === null ? "-" : `+${m.gain}%`} />
            <StatCard label="Evaluation" value={m.evaluation ? `${m.evaluation.mean}/5` : "-"} />
          </div>

          <h3 className="h-serif font-bold text-green-ink mb-2">Financial summary</h3>
          <table className="ledger mb-2">
            <tbody>
              <tr><td>Budgeted</td><td className="text-right mono">{money(bt?.budget ?? 0)}</td></tr>
              <tr><td>Actual expenditure</td><td className="text-right mono">{money(bt?.actual ?? 0)}</td></tr>
              <tr className="font-bold"><td>Variance</td><td className="text-right mono">{money(bt?.variance ?? 0)}</td></tr>
            </tbody>
          </table>
          <p className="text-xs text-faint mt-4">
            Generated {new Date().toLocaleDateString("en-GB")} - Parliamentary Training Institute.
          </p>
        </Card>
      )}
    </div>
  );
}
