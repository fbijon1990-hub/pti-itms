import { PageHeader, StatusBadge, Card } from "@/components/ui";
import { getTrainings } from "@/lib/queries";
import { fdaterange } from "@/lib/format";
import { saveTraining, deleteTraining } from "./actions";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams
}: {
  searchParams: { edit?: string; new?: string };
}) {
  const trainings = await getTrainings();
  const editing = searchParams.edit ? trainings.find((t) => t.id === searchParams.edit) : null;
  const showForm = !!searchParams.new || !!editing;

  return (
    <div>
      <PageHeader
        title="Training Calendar"
        subtitle="Schedule and manage all training programmes"
        action={
          !showForm ? (
            <a href="/calendar?new=1" className="btn-primary">+ New programme</a>
          ) : (
            <a href="/calendar" className="btn-ghost">Close</a>
          )
        }
      />

      {showForm && (
        <Card className="mb-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-4">
            {editing ? "Edit programme" : "New programme"}
          </h2>
          <form action={saveTraining} className="grid md:grid-cols-2 gap-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="md:col-span-2">
              <label className="label">Title</label>
              <input name="title" required className="field" defaultValue={editing?.title ?? ""} />
            </div>
            <div>
              <label className="label">Category</label>
              <input name="category" className="field" defaultValue={editing?.category ?? ""} placeholder="Oversight, Financial..." />
            </div>
            <div>
              <label className="label">Mode</label>
              <select name="mode" className="field" defaultValue={editing?.mode ?? "In-person"}>
                <option>In-person</option>
                <option>Virtual</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div>
              <label className="label">Start date</label>
              <input name="start_date" type="date" required className="field" defaultValue={editing?.start_date ?? ""} />
            </div>
            <div>
              <label className="label">End date</label>
              <input name="end_date" type="date" required className="field" defaultValue={editing?.end_date ?? ""} />
            </div>
            <div>
              <label className="label">Venue</label>
              <input name="venue" className="field" defaultValue={editing?.venue ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Capacity</label>
                <input name="capacity" type="number" className="field" defaultValue={editing?.capacity ?? 20} />
              </div>
              <div>
                <label className="label">Status</label>
                <select name="status" className="field" defaultValue={editing?.status ?? "Planned"}>
                  <option>Planned</option>
                  <option>Open</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">Objectives</label>
              <textarea name="objectives" rows={3} className="field" defaultValue={editing?.objectives ?? ""} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button className="btn-primary">{editing ? "Save changes" : "Create programme"}</button>
              <a href="/calendar" className="btn-ghost">Cancel</a>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {trainings.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No programmes yet. Create the first one.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Category</th>
                <th>Dates</th>
                <th>Mode</th>
                <th>Cap.</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.title}</td>
                  <td>{t.category}</td>
                  <td>{fdaterange(t.start_date, t.end_date)}</td>
                  <td>{t.mode}</td>
                  <td>{t.capacity}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="text-right whitespace-nowrap">
                    <a href={`/calendar?edit=${t.id}`} className="text-green underline text-xs mr-3">Edit</a>
                    <form action={deleteTraining} className="inline">
                      <input type="hidden" name="id" value={t.id} />
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
