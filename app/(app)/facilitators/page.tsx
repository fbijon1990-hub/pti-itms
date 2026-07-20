import { PageHeader, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getFacilitators, getTrainings } from "@/lib/queries";
import { money } from "@/lib/format";
import {
  saveFacilitator, deleteFacilitator,
  saveHonorarium, setHonorariumStatus, deleteHonorarium
} from "./actions";

export const dynamic = "force-dynamic";

export default async function FacilitatorsPage({
  searchParams
}: {
  searchParams: { edit?: string; new?: string; hon?: string };
}) {
  const sb = createClient();
  const [facilitators, trainings, { data: honoraria }] = await Promise.all([
    getFacilitators(),
    getTrainings(),
    sb.from("honoraria").select("*")
  ]);
  const fMap = new Map(facilitators.map((f) => [f.id, f.name]));
  const tMap = new Map(trainings.map((t) => [t.id, t.title]));
  const editing = searchParams.edit ? facilitators.find((f) => f.id === searchParams.edit) : null;
  const showForm = !!searchParams.new || !!editing;
  const showHon = !!searchParams.hon;

  return (
    <div>
      <PageHeader
        title="Facilitators & Honoraria"
        subtitle="Resource persons and payment schedule"
        action={
          !showForm ? (
            <a href="/facilitators?new=1" className="btn-primary">+ Add facilitator</a>
          ) : (
            <a href="/facilitators" className="btn-ghost">Close</a>
          )
        }
      />

      {showForm && (
        <Card className="mb-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-4">
            {editing ? "Edit facilitator" : "New facilitator"}
          </h2>
          <form action={saveFacilitator} className="grid md:grid-cols-2 gap-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div>
              <label className="label">Name</label>
              <input name="name" required className="field" defaultValue={editing?.name ?? ""} />
            </div>
            <div>
              <label className="label">Title</label>
              <input name="title" className="field" defaultValue={editing?.title ?? ""} />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="field" defaultValue={editing?.email ?? ""} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" className="field" defaultValue={editing?.phone ?? ""} />
            </div>
            <div>
              <label className="label">Daily rate (GHS)</label>
              <input name="rate" type="number" step="0.01" className="field" defaultValue={editing?.rate ?? 0} />
            </div>
            <div>
              <label className="label">Withholding tax (%)</label>
              <input name="tax" type="number" step="0.1" className="field" defaultValue={editing?.tax ?? 7.5} />
            </div>
            <div>
              <label className="label">Payment mode</label>
              <input name="pay_mode" className="field" defaultValue={editing?.pay_mode ?? ""} placeholder="Bank transfer, MoMo" />
            </div>
            <div>
              <label className="label">Payment reference</label>
              <input name="pay_ref" className="field" defaultValue={editing?.pay_ref ?? ""} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button className="btn-primary">{editing ? "Save changes" : "Add facilitator"}</button>
              <a href="/facilitators" className="btn-ghost">Cancel</a>
            </div>
          </form>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Facilitators</h2>
        {facilitators.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">No facilitators yet.</p>
        ) : (
          <table className="ledger">
            <thead>
              <tr><th>Name</th><th>Title</th><th>Contact</th><th className="text-right">Daily rate</th><th>Payment</th><th></th></tr>
            </thead>
            <tbody>
              {facilitators.map((f) => (
                <tr key={f.id}>
                  <td className="font-medium">{f.name}</td>
                  <td>{f.title}</td>
                  <td className="text-xs text-muted">{f.email}<br />{f.phone}</td>
                  <td className="text-right mono">{money(f.rate)}</td>
                  <td className="text-xs">{f.pay_mode}<br /><span className="text-muted">{f.pay_ref}</span></td>
                  <td className="text-right whitespace-nowrap">
                    <a href={`/facilitators?edit=${f.id}`} className="text-green underline text-xs mr-3">Edit</a>
                    <form action={deleteFacilitator} className="inline">
                      <input type="hidden" name="id" value={f.id} />
                      <button className="text-bad underline text-xs">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="h-serif text-lg font-bold text-green-ink">Honoraria schedule</h2>
          {!showHon
            ? <a href="/facilitators?hon=1" className="btn-ghost py-1.5 px-3 text-xs">+ Add honorarium</a>
            : <a href="/facilitators" className="btn-ghost py-1.5 px-3 text-xs">Close</a>}
        </div>

        {showHon && (
          <form action={saveHonorarium} className="grid md:grid-cols-5 gap-3 mb-4 p-3 bg-green-soft/30 rounded">
            <div>
              <label className="label">Facilitator</label>
              <select name="facilitator_id" required className="field">
                <option value="">Select...</option>
                {facilitators.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Programme</label>
              <select name="training_id" required className="field">
                <option value="">Select...</option>
                {trainings.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Days</label>
              <input name="days" type="number" step="0.5" required className="field" />
            </div>
            <div>
              <label className="label">Rate/day (GHS)</label>
              <input name="rate" type="number" step="0.01" required className="field" />
            </div>
            <div className="flex items-end">
              <button className="btn-primary w-full">Add</button>
            </div>
          </form>
        )}

        <table className="ledger">
          <thead>
            <tr>
              <th>Facilitator</th><th>Programme</th><th className="text-right">Days</th>
              <th className="text-right">Rate</th><th className="text-right">Gross</th>
              <th className="text-right">Tax</th><th className="text-right">Net</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {(honoraria ?? []).map((h) => {
              const fac = facilitators.find((f) => f.id === h.facilitator_id);
              const taxRate = Number(fac?.tax ?? 7.5) / 100;
              const gross = Number(h.gross);
              const tax = gross * taxRate;
              return (
                <tr key={h.id}>
                  <td className="font-medium">{fMap.get(h.facilitator_id)}</td>
                  <td>{tMap.get(h.training_id)}</td>
                  <td className="text-right mono">{h.days}</td>
                  <td className="text-right mono">{money(h.rate)}</td>
                  <td className="text-right mono">{money(gross)}</td>
                  <td className="text-right mono">{money(tax)}</td>
                  <td className="text-right mono">{money(gross - tax)}</td>
                  <td><StatusBadge status={h.status} /></td>
                  <td className="text-right whitespace-nowrap">
                    <form action={setHonorariumStatus} className="inline">
                      <input type="hidden" name="id" value={h.id} />
                      <input type="hidden" name="status" value={h.status === "Paid" ? "Pending" : "Paid"} />
                      <button className="text-green underline text-xs mr-3">
                        {h.status === "Paid" ? "Mark pending" : "Mark paid"}
                      </button>
                    </form>
                    <form action={deleteHonorarium} className="inline">
                      <input type="hidden" name="id" value={h.id} />
                      <button className="text-bad underline text-xs">Delete</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {(!honoraria || honoraria.length === 0) && (
              <tr><td colSpan={9} className="text-center text-muted py-4">No honoraria recorded.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
