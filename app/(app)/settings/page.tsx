import { PageHeader, Card } from "@/components/ui";
import { getInstitution } from "@/lib/queries";
import { saveSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const inst = await getInstitution();
  return (
    <div>
      <PageHeader title="Settings & Data" subtitle="Institution profile and certification rules" />
      <Card className="max-w-2xl">
        <form action={saveSettings} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Institution name</label>
            <input name="name" className="field" defaultValue={inst?.name ?? ""} />
          </div>
          <div>
            <label className="label">Parent body</label>
            <input name="parent" className="field" defaultValue={inst?.parent ?? ""} />
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" className="field" defaultValue={inst?.location ?? ""} />
          </div>
          <div>
            <label className="label">Signatory 1</label>
            <input name="signatory1" className="field" defaultValue={inst?.signatory1 ?? ""} />
          </div>
          <div>
            <label className="label">Signatory 2</label>
            <input name="signatory2" className="field" defaultValue={inst?.signatory2 ?? ""} />
          </div>
          <div>
            <label className="label">Certificate prefix</label>
            <input name="cert_prefix" className="field" defaultValue={inst?.cert_prefix ?? "PTI"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Pass mark</label>
              <input name="pass_mark" type="number" className="field" defaultValue={inst?.pass_mark ?? 12} />
            </div>
            <div>
              <label className="label">Min attendance %</label>
              <input name="attendance_min" type="number" className="field" defaultValue={inst?.attendance_min ?? 70} />
            </div>
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary">Save settings</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
