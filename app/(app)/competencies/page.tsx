import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getCompetencies, getParticipants, getTrainings } from "@/lib/queries";
import { saveCompetency, deleteCompetency, saveRecord, deleteRecord } from "./actions";

export const dynamic = "force-dynamic";

export default async function CompetenciesPage({ searchParams }: { searchParams: { new?: string; rec?: string } }) {
  const sb = createClient();
  const [competencies, participants, trainings, { data: records }] = await Promise.all([
    getCompetencies(),
    getParticipants(),
    getTrainings(),
    sb.from("competency_records").select("*")
  ]);
  const cMap = new Map(competencies.map((c) => [c.id, c.name]));
  const pMap = new Map(participants.map((p) => [p.id, p.name]));

  return (
    <div>
      <PageHeader title="Competency Records" subtitle="Framework and pre/post proficiency gains (1-5)" />

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="h-serif text-lg font-bold text-green-ink">Competency framework</h2>
          {searchParams.new
            ? <a href="/competencies" className="btn-ghost py-1.5 px-3 text-xs">Close</a>
            : <a href="/competencies?new=1" className="btn-ghost py-1.5 px-3 text-xs">+ Add competency</a>}
        </div>
        {searchParams.new && (
          <form action={saveCompetency} className="grid md:grid-cols-3 gap-3 items-end mb-4 p-3 bg-green-soft/30 rounded">
            <div>
              <label className="label">Competency</label>
              <input name="name" required className="field" placeholder="Legislative Drafting" />
            </div>
            <div>
              <label className="label">Area</label>
              <input name="area" className="field" placeholder="Legislative" />
            </div>
            <button className="btn-primary">Add</button>
          </form>
        )}
        <table className="ledger">
          <thead><tr><th>Competency</th><th>Area</th><th></th></tr></thead>
          <tbody>
            {competencies.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td>{c.area}</td>
                <td className="text-right">
                  <form action={deleteCompetency} className="inline">
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-bad underline text-xs">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {competencies.length === 0 && <tr><td colSpan={3} className="text-center text-muted py-3">No competencies yet.</td></tr>}
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="h-serif text-lg font-bold text-green-ink">Proficiency gains</h2>
          {searchParams.rec
            ? <a href="/competencies" className="btn-ghost py-1.5 px-3 text-xs">Close</a>
            : <a href="/competencies?rec=1" className="btn-ghost py-1.5 px-3 text-xs">+ Add record</a>}
        </div>

        {searchParams.rec && (
          <form action={saveRecord} className="grid md:grid-cols-5 gap-3 items-end mb-4 p-3 bg-green-soft/30 rounded">
            <div>
              <label className="label">Participant</label>
              <select name="participant_id" required className="field">
                <option value="">Select...</option>
                {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Competency</label>
              <select name="competency_id" required className="field">
                <option value="">Select...</option>
                {competencies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Programme</label>
              <select name="training_id" required className="field">
                <option value="">Select...</option>
                {trainings.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label">Before</label><input name="pre" type="number" min={1} max={5} required className="field" /></div>
              <div><label className="label">After</label><input name="post" type="number" min={1} max={5} required className="field" /></div>
            </div>
            <button className="btn-primary">Add</button>
          </form>
        )}

        {!records || records.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">No competency records yet.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr><th>Participant</th><th>Competency</th><th className="text-center">Before</th><th className="text-center">After</th><th className="text-center">Gain</th><th></th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{pMap.get(r.participant_id) ?? r.participant_id}</td>
                  <td>{cMap.get(r.competency_id) ?? r.competency_id}</td>
                  <td className="text-center mono">{r.pre}</td>
                  <td className="text-center mono">{r.post}</td>
                  <td className="text-center mono font-bold text-ok">+{(Number(r.post) - Number(r.pre)) || 0}</td>
                  <td className="text-right">
                    <form action={deleteRecord} className="inline">
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-bad underline text-xs">Remove</button>
                    </form>
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
