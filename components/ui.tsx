import { statusTone } from "@/lib/format";

export function PageHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="card card-pad">
      <p className="stat-label">{label}</p>
      <p className="stat-num mt-1">{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone = statusTone(status);
  return <span className={`badge-${tone}`}>{status}</span>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="card card-pad text-center text-sm text-muted py-10">{children}</div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card card-pad ${className}`}>{children}</div>;
}
