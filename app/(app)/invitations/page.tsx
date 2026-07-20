import { PageHeader, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getParticipants, getTrainings } from "@/lib/queries";
import { fdate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InvitationsPage() {
  const sb = createClient();
  const [{ data: notes }, participants, trainings] = await Promise.all([
    sb.from("notifications").select("*").order("sent_on", { ascending: false }),
    getParticipants(),
    getTrainings()
  ]);
  const pMap = new Map(participants.map((p) => [p.id, p.name]));
  const tMap = new Map(trainings.map((t) => [t.id, t.title]));

  return (
    <div>
      <PageHeader title="Invitations & Notices" subtitle="Communications log. Approving a nomination auto-generates an invitation." />
      <Card>
        {!notes || notes.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No notifications sent yet.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr><th>Type</th><th>Subject</th><th>Recipient</th><th>Programme</th><th>Sent</th><th>Status</th></tr>
            </thead>
            <tbody>
              {notes.map((n) => (
                <tr key={n.id}>
                  <td>{n.type}</td>
                  <td className="font-medium">{n.subject}</td>
                  <td>{n.participant_id ? pMap.get(n.participant_id) : "-"}</td>
                  <td>{n.training_id ? tMap.get(n.training_id) : "-"}</td>
                  <td>{fdate(n.sent_on)}</td>
                  <td><StatusBadge status={n.status ?? "Sent"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
