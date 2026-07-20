import { PageHeader, StatCard, StatusBadge, Card } from "@/components/ui";
import { dashboardStats, trainingMetrics } from "@/lib/queries";
import { fdaterange } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const s = await dashboardStats();

  // Most recent completed programme, for an at-a-glance outcomes panel.
  const sb = await import("@/lib/supabase/server").then((m) => m.createClient());
  const { data: done } = await sb
    .from("trainings")
    .select("id, title, start_date, end_date")
    .eq("status", "Completed")
    .order("end_date", { ascending: false })
    .limit(1);
  const latest = done?.[0];
  const m = latest ? await trainingMetrics(latest.id) : null;

  const total = Object.values(s.byStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <PageHeader
        title="Management Dashboard"
        subtitle="Portfolio overview across all training programmes"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Programmes" value={s.trainingCount} hint={`${s.byStatus.Completed || 0} completed`} />
        <StatCard label="Participants" value={s.participantCount} />
        <StatCard label="Certificates issued" value={s.certCount} />
        <StatCard label="Pending nominations" value={s.pendingNominations} hint="awaiting approval" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-4">Upcoming programmes</h2>
          {s.upcoming.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No upcoming programmes scheduled.</p>
          ) : (
            <table className="ledger">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Dates</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {s.upcoming.map((t: any) => (
                  <tr key={t.id}>
                    <td className="font-medium">{t.title}</td>
                    <td>{fdaterange(t.start_date, t.end_date)}</td>
                    <td>{t.mode}</td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h2 className="h-serif text-lg font-bold text-green-ink mb-4">Programmes by status</h2>
          <div className="space-y-3">
            {Object.entries(s.byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">{status}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-green-soft overflow-hidden">
                  <div
                    className="h-full bg-green"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {latest && m && (
        <Card className="mt-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-1">
            Latest completed: {latest.title}
          </h2>
          <p className="text-sm text-muted mb-4">{fdaterange(latest.start_date, latest.end_date)}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Enrolled" value={m.enrolled} />
            <StatCard label="Attendance" value={`${m.attendanceRate}%`} />
            <StatCard
              label="Knowledge gain"
              value={m.gain === null ? "-" : `+${m.gain}%`}
              hint={m.pre && m.post ? `${m.pre.pct}% to ${m.post.pct}%` : undefined}
            />
            <StatCard
              label="Evaluation"
              value={m.evaluation ? `${m.evaluation.mean}/5` : "-"}
              hint={m.evaluation ? `${m.evaluation.n} responses` : undefined}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
