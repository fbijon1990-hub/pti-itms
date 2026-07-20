import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/format";
import { saveBudget, deleteBudget, saveLine, deleteLine } from "./actions";

export const dynamic = "force-dynamic";

export default async function BudgetsPage({ searchParams }: { searchParams: { new?: string } }) {
  const sb = createClient();
  const [{ data: budgets }, { data: lines }] = await Promise.all([
    sb.from("budgets").select("*"),
    sb.from("budget_lines").select("*").order("sort")
  ]);

  let gBudget = 0, gActual = 0;
  (lines ?? []).forEach((l) => { gBudget += Number(l.budget || 0); gActual += Number(l.actual || 0); });

  return (
    <div>
      <PageHeader
        title="Training Budgets"
        subtitle="Budgeted versus actual expenditure by programme"
        action={
          searchParams.new
            ? <a href="/budgets" className="btn-ghost">Close</a>
            : <a href="/budgets?new=1" className="btn-primary">+ New budget</a>
        }
      />

      {searchParams.new && (
        <Card className="mb-6">
          <h2 className="h-serif text-lg font-bold text-green-ink mb-3">New budget</h2>
          <form action={saveBudget} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="label">Budget title</label>
              <input name="title" required className="field" placeholder="Committee Oversight Masterclass" />
            </div>
            <button className="btn-primary">Create budget</button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><p className="stat-label">Total budgeted</p><p className="stat-num mt-1">{money(gBudget)}</p></Card>
        <Card><p className="stat-label">Total actual</p><p className="stat-num mt-1">{money(gActual)}</p></Card>
        <Card><p className="stat-label">Variance</p><p className="stat-num mt-1">{money(gBudget - gActual)}</p></Card>
      </div>

      {(!budgets || budgets.length === 0) && (
        <Card><p className="text-sm text-muted py-4 text-center">No budgets yet. Create the first one.</p></Card>
      )}

      <div className="space-y-6">
        {(budgets ?? []).map((b) => {
          const bl = (lines ?? []).filter((l) => l.budget_id === b.id);
          const bt = bl.reduce((s, l) => s + Number(l.budget || 0), 0);
          const at = bl.reduce((s, l) => s + Number(l.actual || 0), 0);
          return (
            <Card key={b.id}>
              <div className="flex justify-between items-baseline mb-3">
                <h2 className="h-serif text-lg font-bold text-green-ink">{b.title}</h2>
                <form action={deleteBudget}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="text-bad underline text-xs">Delete budget</button>
                </form>
              </div>
              <table className="ledger mb-3">
                <thead>
                  <tr><th>Line item</th><th className="text-right">Budgeted</th><th className="text-right">Actual</th><th className="text-right">Variance</th><th></th></tr>
                </thead>
                <tbody>
                  {bl.map((l) => (
                    <tr key={l.id}>
                      <td>{l.item}</td>
                      <td className="text-right mono">{money(l.budget)}</td>
                      <td className="text-right mono">{money(l.actual)}</td>
                      <td className="text-right mono">{money(Number(l.budget) - Number(l.actual))}</td>
                      <td className="text-right">
                        <form action={deleteLine} className="inline">
                          <input type="hidden" name="id" value={l.id} />
                          <button className="text-bad underline text-xs">Remove</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td>Total</td>
                    <td className="text-right mono">{money(bt)}</td>
                    <td className="text-right mono">{money(at)}</td>
                    <td className="text-right mono">{money(bt - at)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              <form action={saveLine} className="grid grid-cols-[1fr_140px_140px_auto] gap-2 items-end">
                <input type="hidden" name="budget_id" value={b.id} />
                <div>
                  <label className="label">Add line item</label>
                  <input name="item" required className="field" placeholder="Venue hire" />
                </div>
                <div>
                  <label className="label">Budgeted</label>
                  <input name="budget" type="number" step="0.01" className="field" defaultValue={0} />
                </div>
                <div>
                  <label className="label">Actual</label>
                  <input name="actual" type="number" step="0.01" className="field" defaultValue={0} />
                </div>
                <button className="btn-primary">Add</button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
