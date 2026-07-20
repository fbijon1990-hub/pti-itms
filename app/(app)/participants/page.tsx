import { PageHeader, Card } from "@/components/ui";
import { getParticipants } from "@/lib/queries";
import { saveParticipant, deleteParticipant } from "./actions";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage({
  searchParams
}: {
  searchParams: { edit?: string; new?: string };
}) {
  const people = await getParticipants();
  const editing = searchParams.edit ? people.find((p) => p.id === searchParams.edit) : null;
  const showForm = !!searchParams.new || !!editing;

  return (
    <div>
      <PageHeader
        title="Participants"
        subtitle="Register of nominees and trainees"
        action={
          !showForm ? (
            <a href="/participants?new=1" className="btn-primary">+ Add participant</a>
          ) : (
            <a href="/participants" className="btn-ghost">Close</a>
          )
        }
      />

      {showForm && (
        <Card className="mb-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-4">
            {editing ? "Edit participant" : "New participant"}
          </h2>
          <form action={saveParticipant} className="grid md:grid-cols-2 gap-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div>
              <label className="label">Full name</label>
              <input name="name" required className="field" defaultValue={editing?.name ?? ""} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select name="gender" className="field" defaultValue={editing?.gender ?? ""}>
                <option value="">-</option>
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
            <div>
              <label className="label">Institution</label>
              <input name="institution" className="field" defaultValue={editing?.institution ?? "Parliament of Ghana"} />
            </div>
            <div>
              <label className="label">Department / Office</label>
              <input name="dept" className="field" defaultValue={editing?.dept ?? ""} />
            </div>
            <div>
              <label className="label">Position</label>
              <input name="position" className="field" defaultValue={editing?.position ?? ""} />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="field" defaultValue={editing?.email ?? ""} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" className="field" defaultValue={editing?.phone ?? ""} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button className="btn-primary">{editing ? "Save changes" : "Add participant"}</button>
              <a href="/participants" className="btn-ghost">Cancel</a>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {people.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center">No participants registered yet.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Contact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.dept}</td>
                  <td>{p.position}</td>
                  <td className="text-xs text-muted">
                    {p.email}<br />{p.phone}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <a href={`/participants?edit=${p.id}`} className="text-green underline text-xs mr-3">Edit</a>
                    <form action={deleteParticipant} className="inline">
                      <input type="hidden" name="id" value={p.id} />
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
