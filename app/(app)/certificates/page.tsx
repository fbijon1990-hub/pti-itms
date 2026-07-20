import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getParticipants, getTrainings } from "@/lib/queries";
import { fdate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const sb = createClient();
  const [{ data: certs }, participants, trainings] = await Promise.all([
    sb.from("certificates").select("*").order("issued_on", { ascending: false }),
    getParticipants(),
    getTrainings()
  ]);
  const pMap = new Map(participants.map((p) => [p.id, p.name]));
  const tMap = new Map(trainings.map((t) => [t.id, t.title]));

  return (
    <div>
      <PageHeader
        title="Certificates"
        subtitle="Issued on satisfactory attendance and post-assessment. Verify by certificate number."
      />
      <Card>
        {!certs || certs.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No certificates issued yet.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr><th>Number</th><th>Participant</th><th>Programme</th><th>Issued</th></tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id}>
                  <td className="mono font-medium">{c.number}</td>
                  <td>{pMap.get(c.participant_id) ?? c.participant_id}</td>
                  <td>{tMap.get(c.training_id) ?? c.training_id}</td>
                  <td>{fdate(c.issued_on)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
