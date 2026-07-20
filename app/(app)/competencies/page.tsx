import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getCompetencies, getParticipants } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CompetenciesPage() {
  const sb = createClient();
  const [competencies, participants, { data: records }] = await Promise.all([
    getCompetencies(),
    getParticipants(),
    sb.from("competency_records").select("*")
  ]);
  const cMap = new Map(competencies.map((c) => [c.id, c.name]));
  const pMap = new Map(participants.map((p) => [p.id, p.name]));

  return (
    <div>
      <PageHeader title="Competency Records" subtitle="Framework and pre/post proficiency gains (1-5)" />

      <Card className="mb-6">
        <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Competency framework</h2>
        <table className="ledger">
          <thead><tr><th>Competency</th><th>Area</th></tr></thead>
          <tbody>
            {competencies.map((c) => (
              <tr key={c.id}><td className="font-medium">{c.name}</td><td>{c.area}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Proficiency gains</h2>
        {!records || records.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">No competency records yet.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr><th>Participant</th><th>Competency</th><th className="text-center">Before</th><th className="text-center">After</th><th className="text-center">Gain</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{pMap.get(r.participant_id) ?? r.participant_id}</td>
                  <td>{cMap.get(r.competency_id) ?? r.competency_id}</td>
                  <td className="text-center mono">{r.pre}</td>
                  <td className="text-center mono">{r.post}</td>
                  <td className="text-center mono font-bold text-ok">
                    +{(Number(r.post) - Number(r.pre)) || 0}
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
