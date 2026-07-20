import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getTrainings, getParticipants, trainingMetrics } from "@/lib/queries";
import { fdate } from "@/lib/format";
import { toggleAttendance } from "./actions";

export const dynamic = "force-dynamic";

export default async function AttendancePage({ searchParams }: { searchParams: { t?: string } }) {
  const sb = createClient();
  const trainings = await getTrainings();
  const active = searchParams.t || trainings[0]?.id;
  const participants = await getParticipants();
  const pMap = new Map(participants.map((p) => [p.id, p.name]));

  const [{ data: sessions }, { data: rows }, { data: approved }, metrics] = await Promise.all([
    sb.from("training_sessions").select("*").eq("training_id", active).order("session_date"),
    sb.from("attendance").select("*").eq("training_id", active),
    sb.from("nominations").select("participant_id").eq("training_id", active).eq("status", "Approved"),
    active ? trainingMetrics(active) : Promise.resolve(null)
  ]);

  const present = new Set((rows ?? []).map((r) => `${r.participant_id}|${r.session_date}`));
  const enrolledIds = (approved ?? []).map((a) => a.participant_id);

  return (
    <div>
      <PageHeader
        title="Attendance Register"
        subtitle="Tap a cell to mark present or absent. Attendance rolls up to the dashboard and certificates."
      />
      <div className="flex gap-2 flex-wrap mb-4">
        {trainings.map((t) => (
          <a key={t.id} href={`/attendance?t=${t.id}`}
            className={`btn ${t.id === active ? "btn-primary" : "btn-ghost"} py-1.5 px-3 text-xs`}>
            {t.title}
          </a>
        ))}
      </div>

      {metrics && (
        <Card className="mb-4">
          <p className="text-sm">
            Overall attendance rate:{" "}
            <span className="font-bold text-green-ink text-lg">{metrics.attendanceRate}%</span>{" "}
            across {sessions?.length ?? 0} session(s), {enrolledIds.length} enrolled.
          </p>
        </Card>
      )}

      <Card>
        {!sessions || sessions.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No sessions defined for this programme. Set its dates in the Training Calendar.</p>
        ) : enrolledIds.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No approved participants yet. Approve nominations first.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr>
                <th>Participant</th>
                {sessions.map((s) => <th key={s.id} className="text-center">{fdate(s.session_date)}</th>)}
              </tr>
            </thead>
            <tbody>
              {enrolledIds.map((pid) => (
                <tr key={pid}>
                  <td className="font-medium">{pMap.get(pid) ?? pid}</td>
                  {sessions.map((s) => {
                    const isPresent = present.has(`${pid}|${s.session_date}`);
                    return (
                      <td key={s.id} className="text-center">
                        <form action={toggleAttendance} className="inline">
                          <input type="hidden" name="training_id" value={active} />
                          <input type="hidden" name="participant_id" value={pid} />
                          <input type="hidden" name="session_date" value={s.session_date} />
                          <input type="hidden" name="present" value={isPresent ? "1" : "0"} />
                          <button
                            className={
                              "rounded px-2 py-1 text-xs font-semibold " +
                              (isPresent ? "bg-ok-soft text-ok" : "bg-paper text-faint border border-border")
                            }
                          >
                            {isPresent ? "present" : "mark"}
                          </button>
                        </form>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
