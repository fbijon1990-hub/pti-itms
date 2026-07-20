import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getTrainings, getParticipants } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CohortsPage() {
  const sb = createClient();
  const [{ data: cohorts }, { data: members }, trainings, participants] = await Promise.all([
    sb.from("cohorts").select("*"),
    sb.from("cohort_members").select("*"),
    getTrainings(),
    getParticipants()
  ]);
  const pMap = new Map(participants.map((p) => [p.id, p.name]));
  const tMap = new Map(trainings.map((t) => [t.id, t.title]));

  return (
    <div>
      <PageHeader title="Cohort Allocation" subtitle="Groups drawn from approved nominations" />
      {!cohorts || cohorts.length === 0 ? (
        <Card><p className="text-sm text-muted py-6 text-center">No cohorts allocated yet.</p></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {cohorts.map((c) => {
            const mem = (members ?? []).filter((m) => m.cohort_id === c.id);
            return (
              <Card key={c.id}>
                <div className="flex justify-between items-baseline mb-2">
                  <h2 className="h-serif text-lg font-bold text-green-ink">{c.name}</h2>
                  <span className="text-xs text-muted">{mem.length}/{c.capacity}</span>
                </div>
                <p className="text-xs text-muted mb-3">{tMap.get(c.training_id)}</p>
                <ul className="text-sm space-y-1">
                  {mem.map((m) => (
                    <li key={m.participant_id} className="border-b border-border py-1">
                      {pMap.get(m.participant_id) ?? m.participant_id}
                    </li>
                  ))}
                  {mem.length === 0 && <li className="text-muted">No members assigned.</li>}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
