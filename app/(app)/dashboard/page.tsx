"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, FolderOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EventFormModal } from "@/components/calendar/EventFormModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatEventDate, toISODate } from "@/lib/dates";
import { getCustodyForDay } from "@/lib/custody";
import { getCanadianHolidays } from "@/lib/holidays";
import { EVENT_CATEGORIES } from "@/lib/categories";
import {
  createEvent,
  deleteEvent,
  fetchCustodyOverrides,
  fetchCustodyPattern,
  fetchDocuments,
  fetchEventsInRange,
  fetchProfiles,
  updateEvent,
} from "@/lib/data";
import type { CustodyOverride, CustodyPattern, FamilyDocument, FamilyEvent, Profile } from "@/types/database";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pattern, setPattern] = useState<CustodyPattern | null>(null);
  const [overrides, setOverrides] = useState<CustodyOverride[]>([]);
  const [upcoming, setUpcoming] = useState<FamilyEvent[]>([]);
  const [documents, setDocuments] = useState<FamilyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FamilyEvent | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const today = new Date();
  const tomorrow = addDays(today, 1);

  async function load() {
    try {
      const from = toISODate(today);
      const to = toISODate(addDays(today, 14));
      const [p, pat, ov, ev, docs] = await Promise.all([
        fetchProfiles(),
        fetchCustodyPattern(),
        fetchCustodyOverrides(from, to),
        fetchEventsInRange(from, to),
        fetchDocuments(),
      ]);
      setProfiles(p);
      setPattern(pat);
      setOverrides(ov);
      setUpcoming(ev.slice(0, 6));
      setDocuments(docs.slice(0, 4));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);
  const todayCustody = getCustodyForDay(today, pattern, overrides);
  const tomorrowCustody = getCustodyForDay(tomorrow, pattern, overrides);

  async function handleImportHolidays() {
    if (!profile) return;
    setImporting(true);
    try {
      const holidays = getCanadianHolidays(today.getFullYear());
      for (const h of holidays) {
        await createEvent({
          title: h.title,
          description: null,
          start_at: `${h.date}T00:00:00.000Z`,
          end_at: `${h.date}T23:59:59.000Z`,
          all_day: true,
          category: "holiday",
          color: null,
          created_by: profile.id,
        });
      }
      await load();
    } finally {
      setImporting(false);
    }
  }

  if (loading) return <p className="p-6 text-sm text-slate-500">Chargement…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-white">
          Bonjour {profile?.display_name ?? ""} 👋
        </h1>
        <p className="text-sm text-slate-400">{format(today, "EEEE d MMMM yyyy", { locale: fr })}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Garde aujourd&apos;hui</p>
          <CustodyBadge
            am={todayCustody.am ? profileMap.get(todayCustody.am) : undefined}
            pm={todayCustody.pm ? profileMap.get(todayCustody.pm) : undefined}
          />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Garde demain</p>
          <CustodyBadge
            am={tomorrowCustody.am ? profileMap.get(tomorrowCustody.am) : undefined}
            pm={tomorrowCustody.pm ? profileMap.get(tomorrowCustody.pm) : undefined}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <CalendarDays size={16} /> Prochains événements
          </h2>
          <Link href="/calendar" className="text-xs text-indigo-400 hover:underline">
            Voir le calendrier
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500">Rien de prévu dans les 14 prochains jours.</p>
        ) : (
          <ul className="space-y-1">
            {upcoming.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => {
                    setEditingEvent(e);
                    setEventModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-sm hover:bg-white/5"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: e.color || EVENT_CATEGORIES[e.category].color }}
                  />
                  <span className="text-slate-500">
                    {formatEventDate(e.start_at, "d MMM")}
                  </span>
                  <span className="text-slate-200">{e.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <FolderOpen size={16} /> Documents récents
          </h2>
          <Link href="/documents" className="text-xs text-indigo-400 hover:underline">
            Voir les documents
          </Link>
        </div>
        {documents.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun document téléversé.</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-300">
            {documents.map((d) => (
              <li key={d.id}>{d.title}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-white/10 p-4">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles size={16} /> Jours fériés
        </h2>
        <p className="mb-3 text-sm text-slate-400">
          Importer les jours fériés canadiens de {today.getFullYear()} dans le calendrier.
        </p>
        <Button variant="secondary" onClick={handleImportHolidays} disabled={importing}>
          {importing ? "Import…" : "Importer les jours fériés"}
        </Button>
      </div>

      {profile && (
        <EventFormModal
          open={eventModalOpen}
          onClose={() => setEventModalOpen(false)}
          event={editingEvent}
          profiles={profiles}
          currentProfileId={profile.id}
          onSave={async (data) => {
            if (editingEvent) await updateEvent(editingEvent.id, data);
            await load();
          }}
          onDelete={
            editingEvent
              ? async () => {
                  await deleteEvent(editingEvent.id);
                  setEventModalOpen(false);
                  await load();
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function CustodyBadge({ am, pm }: { am: Profile | undefined; pm: Profile | undefined }) {
  if (!am && !pm) return <p className="text-sm text-slate-500">Non configuré</p>;
  if (am && pm && am.id !== pm.id) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: am.color }} />
          <span className="font-semibold text-white">{am.display_name}</span>
          <span className="text-slate-500">(matin)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pm.color }} />
          <span className="font-semibold text-white">{pm.display_name}</span>
          <span className="text-slate-500">(soir)</span>
        </span>
      </div>
    );
  }
  const parent = am ?? pm;
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: parent!.color }} />
      <span className="text-lg font-semibold text-white">{parent!.display_name}</span>
    </div>
  );
}
