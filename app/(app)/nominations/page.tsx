import { PageHeader, StatusBadge, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getParticipants, getTrainings } from "@/lib/queries";
import { fdate } from "@/lib/format";
import { createNomination, setStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function NominationsPage({ searchParams }: { searchParams: { new?: string } }) {
  const sb = createClient();
  const [{ data: noms }, participants, trainings] = await Promise.all([
    sb.from("nominations").select("*").order("nominated_on", { ascending: false }),
    getParticipants(),
    getTrainings()
  ]);
  const pMap = new Map(participants.map((p) => [p.id, p.name]));
  const tMap = new Map(trainings.map((t) => [t.id, t.title]));
  const showForm = !!searchParams.new;

  return (
    <div>
      <PageHeader
        title="Participant Nominations"
        subtitle="Review, approve, waitlist or reject nominations"
        action={
          !showForm ? (
            <a href="/nominations?new=1" className="btn-primary">+ Nominate</a>
          ) : (
            <a href="/nominations" className="btn-ghost">Close</a>
          )
        }
      />

      {showForm && (
        <Card className="mb-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-4">New nomination</h2>
          <form action={createNomination} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Participant</label>
              <select name="participant_id" required className="field">
                <option value="">Select...</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Programme</label>
              <select name="training_id" required className="field">
                <option value="">Select...</option>
                {trainings.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Nominated by</label>
              <input name="nominated_by" className="field" placeholder="Clerk to Parliament" />
            </div>
            <div>
              <label className="label">Justification</label>
              <input name="justification" className="field" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button className="btn-primary">Submit nomination</button>
              <a href="/nominations" className="btn-ghost">Cancel</a>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {!noms || noms.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No nominations yet.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Programme</th>
                <th>Nominated by</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {noms.map((n) => (
                <tr key={n.id}>
                  <td className="font-medium">{pMap.get(n.participant_id) ?? n.participant_id}</td>
                  <td>{tMap.get(n.training_id) ?? n.training_id}</td>
                  <td>{n.nominated_by}</td>
                  <td>{fdate(n.nominated_on)}</td>
                  <td><StatusBadge status={n.status} /></td>
                  <td className="whitespace-nowrap">
                    {["Approved", "Waitlisted", "Rejected"].map((st) => (
                      <form action={setStatus} className="inline" key={st}>
                        <input type="hidden" name="id" value={n.id} />
                        <input type="hidden" name="status" value={st} />
                        <button className="text-xs underline mr-2 text-green">{st}</button>
                      </form>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
