import { PageHeader, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getParticipants, getTrainings } from "@/lib/queries";
import { fdate } from "@/lib/format";
import { sendNotification, deleteNotification } from "./actions";

export const dynamic = "force-dynamic";

export default async function InvitationsPage({ searchParams }: { searchParams: { new?: string } }) {
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
      <PageHeader
        title="Invitations & Notices"
        subtitle="Approving a nomination auto-generates an invitation. You can also send one here."
        action={
          searchParams.new
            ? <a href="/invitations" className="btn-ghost">Close</a>
            : <a href="/invitations?new=1" className="btn-primary">+ Send notice</a>
        }
      />

      {searchParams.new && (
        <Card className="mb-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Send notice</h2>
          <form action={sendNotification} className="grid md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="label">Type</label>
              <select name="type" className="field"><option>Invitation</option><option>Reminder</option><option>Notice</option></select>
            </div>
            <div>
              <label className="label">Programme</label>
              <select name="training_id" required className="field">
                <option value="">Select...</option>
                {trainings.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Participant (optional)</label>
              <select name="participant_id" className="field">
                <option value="">All approved participants</option>
                {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subject (optional)</label>
              <input name="subject" className="field" placeholder="Auto-filled if blank" />
            </div>
            <div className="md:col-span-4">
              <button className="btn-primary">Send</button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {!notes || notes.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No notifications sent yet.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr><th>Type</th><th>Subject</th><th>Recipient</th><th>Programme</th><th>Sent</th><th>Status</th><th></th></tr>
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
                  <td className="text-right">
                    <form action={deleteNotification} className="inline">
                      <input type="hidden" name="id" value={n.id} />
                      <button className="text-bad underline text-xs">Delete</button>
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
