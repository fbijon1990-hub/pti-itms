import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getTrainings, getParticipants } from "@/lib/queries";
import { saveCohort, deleteCohort, addMember, removeMember } from "./actions";

export const dynamic = "force-dynamic";

export default async function CohortsPage({ searchParams }: { searchParams: { new?: string } }) {
  const sb = createClient();
  const [{ data: cohorts }, { data: members }, { data: noms }, trainings, participants] =
    await Promise.all([
      sb.from("cohorts").select("*"),
      sb.from("cohort_members").select("*"),
      sb.from("nominations").select("participant_id, training_id, status").eq("status", "Approved"),
      getTrainings(),
      getParticipants()
    ]);
  const pMap = new Map(participants.map((p) => [p.id, p.name]));
  const tMap = new Map(trainings.map((t) => [t.id, t.title]));

  return (
    <div>
      <PageHeader
        title="Cohort Allocation"
        subtitle="Groups drawn from approved nominations"
        action={
          searchParams.new
            ? <a href="/cohorts" className="btn-ghost">Close</a>
            : <a href="/cohorts?new=1" className="btn-primary">+ New cohort</a>
        }
      />

      {searchParams.new && (
        <Card className="mb-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-3">New cohort</h2>
          <form action={saveCohort} className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="label">Programme</label>
              <select name="training_id" required className="field">
                <option value="">Select...</option>
                {trainings.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Cohort name</label>
              <input name="name" required className="field" placeholder="Group A" />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="label">Capacity</label>
                <input name="capacity" type="number" className="field" defaultValue={12} />
              </div>
              <button className="btn-primary">Create</button>
            </div>
          </form>
        </Card>
      )}

      {(!cohorts || cohorts.length === 0) ? (
        <Card><p className="text-sm text-muted py-6 text-center">No cohorts allocated yet.</p></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {cohorts.map((c) => {
            const mem = (members ?? []).filter((m) => m.cohort_id === c.id);
            const memIds = new Set(mem.map((m) => m.participant_id));
            // approved nominees for this cohort's training, not yet in this cohort
            const eligible = (noms ?? [])
              .filter((n) => n.training_id === c.training_id && !memIds.has(n.participant_id));
            return (
              <Card key={c.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h2 className="h-serif text-lg font-bold text-green-ink">{c.name}</h2>
                  <span className="text-xs text-muted">{mem.length}/{c.capacity}</span>
                </div>
                <p className="text-xs text-muted mb-3">{tMap.get(c.training_id)}</p>
                <ul className="text-sm space-y-1 mb-3">
                  {mem.map((m) => (
                    <li key={m.participant_id} className="flex justify-between border-b border-border py-1">
                      <span>{pMap.get(m.participant_id) ?? m.participant_id}</span>
                      <form action={removeMember} className="inline">
                        <input type="hidden" name="cohort_id" value={c.id} />
                        <input type="hidden" name="participant_id" value={m.participant_id} />
                        <button className="text-bad underline text-xs">Remove</button>
                      </form>
                    </li>
                  ))}
                  {mem.length === 0 && <li className="text-muted">No members assigned.</li>}
                </ul>
                <form action={addMember} className="flex gap-2 items-end">
                  <input type="hidden" name="cohort_id" value={c.id} />
                  <input type="hidden" name="training_id" value={c.training_id} />
                  <div className="flex-1">
                    <label className="label">Add approved nominee</label>
                    <select name="participant_id" required className="field">
                      <option value="">Select...</option>
                      {eligible.map((n) => (
                        <option key={n.participant_id} value={n.participant_id}>
                          {pMap.get(n.participant_id) ?? n.participant_id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="btn-ghost">Add</button>
                </form>
                <div className="text-right mt-3">
                  <form action={deleteCohort} className="inline">
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-bad underline text-xs">Delete cohort</button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
