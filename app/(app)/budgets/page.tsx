import { PageHeader, Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const sb = createClient();
  const [{ data: budgets }, { data: lines }] = await Promise.all([
    sb.from("budgets").select("*"),
    sb.from("budget_lines").select("*").order("sort")
  ]);

  let gBudget = 0, gActual = 0;
  (lines ?? []).forEach((l) => { gBudget += Number(l.budget || 0); gActual += Number(l.actual || 0); });

  return (
    <div>
      <PageHeader title="Training Budgets" subtitle="Budgeted versus actual expenditure by programme" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><p className="stat-label">Total budgeted</p><p className="stat-num mt-1">{money(gBudget)}</p></Card>
        <Card><p className="stat-label">Total actual</p><p className="stat-num mt-1">{money(gActual)}</p></Card>
        <Card><p className="stat-label">Variance</p><p className="stat-num mt-1">{money(gBudget - gActual)}</p></Card>
      </div>

      <div className="space-y-6">
        {(budgets ?? []).map((b) => {
          const bl = (lines ?? []).filter((l) => l.budget_id === b.id);
          const bt = bl.reduce((s, l) => s + Number(l.budget || 0), 0);
          const at = bl.reduce((s, l) => s + Number(l.actual || 0), 0);
          return (
            <Card key={b.id}>
              <h2 className="h-serif text-lg font-bold text-green-ink mb-3">{b.title}</h2>
              <table className="ledger">
                <thead>
                  <tr><th>Line item</th><th className="text-right">Budgeted</th><th className="text-right">Actual</th><th className="text-right">Variance</th></tr>
                </thead>
                <tbody>
                  {bl.map((l) => (
                    <tr key={l.id}>
                      <td>{l.item}</td>
                      <td className="text-right mono">{money(l.budget)}</td>
                      <td className="text-right mono">{money(l.actual)}</td>
                      <td className="text-right mono">{money(Number(l.budget) - Number(l.actual))}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td>Total</td>
                    <td className="text-right mono">{money(bt)}</td>
                    <td className="text-right mono">{money(at)}</td>
                    <td className="text-right mono">{money(bt - at)}</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
