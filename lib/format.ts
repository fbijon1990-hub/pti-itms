// Presentation helpers - British spelling, GHS currency, ASCII-safe.

export function money(n: number | null | undefined): string {
  const v = Number(n || 0);
  return "GHS " + v.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function pct(part: number, whole: number): number {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function initials(name: string): string {
  return (name || "")
    .replace(/^(Hon\.|Prof\.|Dr\.|Mrs\.|Mr\.|Ms\.)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function fdate(d: string | null | undefined): string {
  if (!d) return "-";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return String(d);
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function fdaterange(a?: string | null, b?: string | null): string {
  if (a && b) return `${fdate(a)} - ${fdate(b)}`;
  return fdate(a || b);
}

export function statusTone(status: string): string {
  const s = (status || "").toLowerCase();
  if (["completed", "approved", "paid", "sent", "issued"].includes(s)) return "ok";
  if (["open", "planned", "pending"].includes(s)) return "warn";
  if (["cancelled", "rejected"].includes(s)) return "bad";
  return "info";
}
