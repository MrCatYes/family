"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CalendarSidebar } from "@/components/calendar/CalendarSidebar";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { EventFormModal } from "@/components/calendar/EventFormModal";
import { DayDetailModal } from "@/components/calendar/DayDetailModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatMonthTitle, toISODate } from "@/lib/dates";
import { getCustodyForDay } from "@/lib/custody";
import {
  createEvent,
  deleteCustodyOverride,
  deleteEvent,
  fetchCustodyOverrides,
  fetchCustodyPattern,
  fetchEventsInRange,
  fetchProfiles,
  updateEvent,
  upsertCustodyOverride,
} from "@/lib/data";
import type { EventCategory, CustodyOverride, CustodyPattern, FamilyEvent, Profile } from "@/types/database";

export default function CalendarPage() {
  const { profile } = useAuth();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [custodyPattern, setCustodyPattern] = useState<CustodyPattern | null>(null);
  const [custodyOverrides, setCustodyOverrides] = useState<CustodyOverride[]>([]);
  const [showCustody, setShowCustody] = useState(true);
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(["general", "special", "holiday", "school", "medical", "birthday"])
  );
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FamilyEvent | null>(null);

  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, ev, pattern, overrides] = await Promise.all([
        fetchProfiles(),
        fetchEventsInRange(toISODate(gridStart), toISODate(gridEnd)),
        fetchCustodyPattern(),
        fetchCustodyOverrides(toISODate(gridStart), toISODate(gridEnd)),
      ]);
      setProfiles(p);
      setEvents(ev);
      setCustodyPattern(pattern);
      setCustodyOverrides(overrides);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: shows a loading state while switching months
    load();
  }, [load]);

  const filteredEvents = useMemo(
    () => events.filter((e) => activeCategories.has(e.category)),
    [events, activeCategories]
  );

  function toggleCategory(cat: EventCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function openDay(date: Date) {
    setSelectedDay(date);
    setDayModalOpen(true);
  }

  function openNewEvent(defaultDate?: Date) {
    setEditingEvent(null);
    setSelectedDay(defaultDate ?? selectedDay ?? new Date());
    setEventModalOpen(true);
  }

  function openEditEvent(event: FamilyEvent) {
    setEditingEvent(event);
    setEventModalOpen(true);
  }

  const selectedDayEvents = selectedDay
    ? filteredEvents.filter((e) => {
        const iso = toISODate(selectedDay);
        return e.start_at.slice(0, 10) <= iso && e.end_at.slice(0, 10) >= iso;
      })
    : [];

  const selectedDayOverride = selectedDay
    ? custodyOverrides.find((o) => o.date === toISODate(selectedDay)) ?? null
    : null;

  const selectedDayCustody = selectedDay
    ? getCustodyForDay(selectedDay, custodyPattern, custodyOverrides)
    : { am: null, pm: null };

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">Chargement du profil…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <CalendarSidebar
        profiles={profiles}
        showCustody={showCustody}
        onToggleCustody={setShowCustody}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthDate((d) => subMonths(d, 1))}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <h1 className="w-44 text-lg font-semibold text-white">{formatMonthTitle(monthDate)}</h1>
            <button
              onClick={() => setMonthDate((d) => addMonths(d, 1))}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
            <Button variant="secondary" onClick={() => setMonthDate(new Date())} className="ml-2 text-xs">
              Aujourd&apos;hui
            </Button>
          </div>
          <Button onClick={() => openNewEvent(new Date())}>
            <Plus size={16} /> Créer
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement…</p>
        ) : (
          <MonthGrid
            monthDate={monthDate}
            events={filteredEvents}
            profiles={profiles}
            custodyPattern={custodyPattern}
            custodyOverrides={custodyOverrides}
            showCustody={showCustody}
            onSelectDay={openDay}
            onSelectEvent={openEditEvent}
          />
        )}
      </div>

      <DayDetailModal
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        date={selectedDay}
        events={selectedDayEvents}
        profiles={profiles}
        custodyAmId={selectedDayCustody.am}
        custodyPmId={selectedDayCustody.pm}
        override={selectedDayOverride}
        onAddEvent={() => {
          setDayModalOpen(false);
          openNewEvent(selectedDay ?? undefined);
        }}
        onEditEvent={(event) => {
          setDayModalOpen(false);
          openEditEvent(event);
        }}
        onDeleteEvent={async (id) => {
          await deleteEvent(id);
          await load();
        }}
        onSetOverride={async (amParentId, pmParentId, note) => {
          if (!selectedDay) return;
          await upsertCustodyOverride({
            date: toISODate(selectedDay),
            parent_id: amParentId,
            pm_parent_id: pmParentId === amParentId ? null : pmParentId,
            note: note || null,
            created_by: profile.id,
          });
          await load();
        }}
        onClearOverride={async () => {
          if (!selectedDay) return;
          await deleteCustodyOverride(toISODate(selectedDay));
          await load();
        }}
      />

      <EventFormModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        defaultDate={selectedDay ?? new Date()}
        event={editingEvent}
        profiles={profiles}
        currentProfileId={profile.id}
        onSave={async (data) => {
          if (editingEvent) {
            await updateEvent(editingEvent.id, data);
          } else {
            await createEvent(data);
          }
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
    </div>
  );
}
