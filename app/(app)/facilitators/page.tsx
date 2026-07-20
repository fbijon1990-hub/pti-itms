import { PageHeader, Card, StatusBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getFacilitators, getTrainings } from "@/lib/queries";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FacilitatorsPage() {
  const sb = createClient();
  const [facilitators, trainings, { data: honoraria }] = await Promise.all([
    getFacilitators(),
    getTrainings(),
    sb.from("honoraria").select("*")
  ]);
  const fMap = new Map(facilitators.map((f) => [f.id, f.name]));
  const tMap = new Map(trainings.map((t) => [t.id, t.title]));

  return (
    <div>
      <PageHeader title="Facilitators & Honoraria" subtitle="Resource persons and payment schedule" />

      <Card className="mb-6">
        <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Facilitators</h2>
        <table className="ledger">
          <thead>
            <tr><th>Name</th><th>Title</th><th>Contact</th><th className="text-right">Daily rate</th><th>Payment</th></tr>
          </thead>
          <tbody>
            {facilitators.map((f) => (
              <tr key={f.id}>
                <td className="font-medium">{f.name}</td>
                <td>{f.title}</td>
                <td className="text-xs text-muted">{f.email}<br />{f.phone}</td>
                <td className="text-right mono">{money(f.rate)}</td>
                <td className="text-xs">{f.pay_mode}<br /><span className="text-muted">{f.pay_ref}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h2 className="h-serif text-lg font-bold text-green-ink mb-3">Honoraria schedule</h2>
        <table className="ledger">
          <thead>
            <tr>
              <th>Facilitator</th><th>Programme</th><th className="text-right">Days</th>
              <th className="text-right">Rate</th><th className="text-right">Gross</th>
              <th className="text-right">Tax</th><th className="text-right">Net</th><th>Status</th>
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
                </tr>
              );
            })}
            {(!honoraria || honoraria.length === 0) && (
              <tr><td colSpan={8} className="text-center text-muted py-4">No honoraria recorded.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
