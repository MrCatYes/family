"use client";

import { useEffect, useState } from "react";
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
  Menu,
  X,
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
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!configured || !session)) router.replace("/login");
  }, [loading, configured, session, router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: syncs the drawer to route navigation
    setNavOpen(false);
  }, [pathname]);

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

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between md:block">
        <Link href="/profil" className="mb-6 block rounded-lg px-2 py-1 hover:bg-white/5">
          <p className="text-sm font-semibold text-white">Famille</p>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: profile?.color }} />
            {profile?.display_name ?? "…"}
          </span>
        </Link>
        <button
          onClick={() => setNavOpen(false)}
          className="mb-6 rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
        >
          <X size={18} />
        </button>
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
    </>
  );

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0f1019] p-3 md:hidden">
        <span className="text-sm font-semibold text-white">Famille</span>
        <button
          onClick={() => setNavOpen(true)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <Menu size={20} />
        </button>
      </div>

      {navOpen && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col border-r border-white/10 bg-[#0f1019] p-4 transition-transform duration-200 md:static md:w-60 md:translate-x-0 ${
          navOpen ? "translate-x-0" : ""
        }`}
      >
        {sidebarContent}
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
