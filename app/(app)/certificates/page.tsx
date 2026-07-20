import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getParticipants, getTrainings } from "@/lib/queries";
import { fdate } from "@/lib/format";
import { issueCertificate, issueEligible, revokeCertificate } from "./actions";

export const dynamic = "force-dynamic";

export default async function CertificatesPage({ searchParams }: { searchParams: { t?: string; issue?: string } }) {
  const sb = createClient();
  const trainings = await getTrainings();
  const active = searchParams.t || trainings.find((t) => t.status === "Completed")?.id || trainings[0]?.id;
  const participants = await getParticipants();
  const pMap = new Map(participants.map((p) => [p.id, p.name]));
  const tMap = new Map(trainings.map((t) => [t.id, t.title]));

  const [{ data: certs }, { data: approved }] = await Promise.all([
    sb.from("certificates").select("*").order("issued_on", { ascending: false }),
    sb.from("nominations").select("participant_id").eq("training_id", active).eq("status", "Approved")
  ]);
  const enrolled = (approved ?? []).map((a) => a.participant_id);

  return (
    <div>
      <PageHeader
        title="Certificates"
        subtitle="Issued on satisfactory attendance and post-assessment. Numbers auto-generate from the certificate prefix in Settings."
        action={
          searchParams.issue
            ? <a href="/certificates" className="btn-ghost">Close</a>
            : <a href="/certificates?issue=1" className="btn-primary">Issue certificates</a>
        }
      />

      {searchParams.issue && (
        <Card className="mb-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Issue certificates</h2>
          <div className="flex gap-2 flex-wrap mb-4">
            {trainings.map((t) => (
              <a key={t.id} href={`/certificates?issue=1&t=${t.id}`}
                className={`btn ${t.id === active ? "btn-primary" : "btn-ghost"} py-1.5 px-3 text-xs`}>
                {t.title}
              </a>
            ))}
          </div>

          <form action={issueEligible} className="mb-4">
            <input type="hidden" name="training_id" value={active} />
            <button className="btn-primary">Auto-issue to all eligible</button>
            <span className="text-xs text-muted ml-3">
              Eligible = attendance at or above the minimum and a passing post-assessment (if one exists).
            </span>
          </form>

          <form action={issueCertificate} className="flex gap-2 items-end">
            <input type="hidden" name="training_id" value={active} />
            <div className="flex-1">
              <label className="label">Or issue to a specific participant</label>
              <select name="participant_id" required className="field">
                <option value="">Select approved participant...</option>
                {enrolled.map((pid) => <option key={pid} value={pid}>{pMap.get(pid) ?? pid}</option>)}
              </select>
            </div>
            <button className="btn-ghost">Issue</button>
          </form>
        </Card>
      )}

      <Card>
        {!certs || certs.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No certificates issued yet.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr><th>Number</th><th>Participant</th><th>Programme</th><th>Issued</th><th></th></tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id}>
                  <td className="mono font-medium">{c.number}</td>
                  <td>{pMap.get(c.participant_id) ?? c.participant_id}</td>
                  <td>{tMap.get(c.training_id) ?? c.training_id}</td>
                  <td>{fdate(c.issued_on)}</td>
                  <td className="text-right">
                    <form action={revokeCertificate} className="inline">
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-bad underline text-xs">Revoke</button>
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
