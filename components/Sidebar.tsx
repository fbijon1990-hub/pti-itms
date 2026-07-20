"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { group: string; items: { href: string; label: string }[] }[] = [
  { group: "Overview", items: [{ href: "/dashboard", label: "Management Dashboard" }] },
  {
    group: "Planning",
    items: [
      { href: "/calendar", label: "Training Calendar" },
      { href: "/cohorts", label: "Cohort Allocation" },
      { href: "/budgets", label: "Training Budgets" }
    ]
  },
  {
    group: "People",
    items: [
      { href: "/participants", label: "Participants" },
      { href: "/nominations", label: "Nominations" },
      { href: "/facilitators", label: "Facilitators & Honoraria" }
    ]
  },
  {
    group: "Delivery",
    items: [
      { href: "/invitations", label: "Invitations & Notices" },
      { href: "/attendance", label: "Attendance (QR)" },
      { href: "/assessments", label: "Pre / Post Assessments" },
      { href: "/evaluations", label: "Participant Evaluations" }
    ]
  },
  {
    group: "Outputs",
    items: [
      { href: "/certificates", label: "Certificates" },
      { href: "/competencies", label: "Competency Records" },
      { href: "/reports", label: "Training Reports" }
    ]
  },
  { group: "System", items: [{ href: "/settings", label: "Settings & Data" }] }
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <nav className="p-3 space-y-4">
      {NAV.map((section) => (
        <div key={section.group}>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
            {section.group}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((it) => {
              const active = path === it.href;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={
                      "block rounded px-3 py-2 text-sm transition-colors " +
                      (active
                        ? "bg-gold text-green-ink font-semibold"
                        : "text-white/80 hover:bg-white/10")
                    }
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
