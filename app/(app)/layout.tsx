"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  CalendarDays,
  LayoutDashboard,
  Users,
  FolderOpen,
  ListChecks,
  Contact,
  LogOut,
  Baby,
  Wallet,
  ClipboardCheck,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendrier", icon: CalendarDays },
  { href: "/custody", label: "Garde", icon: Users },
  { href: "/enfant", label: "Fiche enfant", icon: Baby },
  { href: "/depenses", label: "Dépenses", icon: Wallet },
  { href: "/suivi", label: "Suivi mensuel", icon: ClipboardCheck },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/notes", label: "Notes", icon: ListChecks },
  { href: "/contacts", label: "Contacts", icon: Contact },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, profile, loading, configured } = useAuth();

  useEffect(() => {
    if (!loading && (!configured || !session)) router.replace("/login");
  }, [loading, configured, session, router]);

  async function handleLogout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading || !session) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/10 bg-[#0f1019] p-4">
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold text-white">Famille</p>
          <p className="text-xs text-slate-500">
            {profile?.display_name ?? "…"}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-indigo-600/20 text-indigo-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
