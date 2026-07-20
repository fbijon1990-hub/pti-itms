import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { getInstitution } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const inst = await getInstitution();

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="bg-green-ink min-h-screen sticky top-0 self-start h-screen overflow-y-auto">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gold grid place-items-center text-green-ink font-bold h-serif">
            PTI
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight h-serif">
              {inst?.name ?? "PTI"}
            </p>
            <p className="text-white/50 text-[11px]">{inst?.parent ?? "Parliament of Ghana"}</p>
          </div>
        </div>
        <Sidebar />
      </aside>

      {/* Main */}
      <div className="flex flex-col min-h-screen">
        <header className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <p className="text-sm text-muted">
            {inst?.location ?? "Parliament House, Accra"}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:inline">{user?.email}</span>
            <form action={signOut}>
              <button className="btn-ghost py-1.5 px-3 text-xs">Sign out</button>
            </form>
          </div>
        </header>
        <main className="p-6 flex-1">{children}</main>
        <footer className="px-6 py-4 text-xs text-faint border-t border-border">
          {inst?.name ?? "Parliamentary Training Institute"} - Institutional Training Management System
        </footer>
      </div>
    </div>
  );
}
