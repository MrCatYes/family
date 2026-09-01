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
import { formatMonthTitle, isSameDay, toISODate } from "@/lib/dates";
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
  const [newEventEndDate, setNewEventEndDate] = useState<Date | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FamilyEvent | null>(null);

  const [dragAnchor, setDragAnchor] = useState<Date | null>(null);
  const [dragHover, setDragHover] = useState<Date | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [dragFromBand, setDragFromBand] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  function openNewEvent(defaultDate?: Date, endDate?: Date) {
    setEditingEvent(null);
    const start = defaultDate ?? selectedDay ?? new Date();
    setSelectedDay(start);
    setNewEventEndDate(endDate ?? start);
    setEventModalOpen(true);
  }

  function openEditEvent(event: FamilyEvent) {
    setEditingEvent(event);
    setEventModalOpen(true);
  }

  function handleCellMouseDown(date: Date, clientX: number, clientY: number, fromBand: boolean) {
    setDragAnchor(date);
    setDragHover(date);
    setDragStartPos({ x: clientX, y: clientY });
    setDragFromBand(fromBand);
    // isDragging stays false until the mouse actually moves past a small threshold —
    // this keeps a plain click (with the tiny, unavoidable mouse drift real clicks have)
    // from being misread as a drag and opening the event form instead of the day panel.
  }

  function handleCellMouseEnter(date: Date) {
    if (isDragging) setDragHover(date);
  }

  // Promotes a pending mousedown into an actual drag once the cursor has moved enough
  // to be a deliberate gesture rather than click jitter.
  useEffect(() => {
    if (!dragAnchor || isDragging) return;
    function handleMouseMove(e: MouseEvent) {
      if (!dragStartPos) return;
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      if (Math.hypot(dx, dy) > 6) setIsDragging(true);
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [dragAnchor, dragStartPos, isDragging]);

  async function handleBandClick(date: Date) {
    if (!profile || profiles.length < 2) return;
    const custody = getCustodyForDay(date, custodyPattern, custodyOverrides);
    const current = custody.am ?? custody.pm;
    const nextParent = profiles.find((p) => p.id !== current) ?? profiles[0];
    await upsertCustodyOverride({
      date: toISODate(date),
      parent_id: nextParent.id,
      pm_parent_id: null,
      note: null,
      created_by: profile.id,
    });
    await load();
  }

  useEffect(() => {
    if (!dragAnchor) return;
    function handleMouseUp() {
      const anchor = dragAnchor;
      const hover = dragHover ?? anchor;
      const wasDragging = isDragging;
      const startedOnBand = dragFromBand;
      setIsDragging(false);
      setDragAnchor(null);
      setDragHover(null);
      setDragStartPos(null);
      setDragFromBand(false);
      if (!anchor) return;
      if (wasDragging && hover && !isSameDay(anchor, hover)) {
        const start = anchor < hover ? anchor : hover;
        const end = anchor < hover ? hover : anchor;
        openNewEvent(start, end);
      } else if (startedOnBand) {
        handleBandClick(anchor);
      } else {
        openDay(anchor);
      }
    }
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragAnchor, dragHover, isDragging, dragFromBand]);

  const dragRange = useMemo(() => {
    if (!isDragging || !dragAnchor || !dragHover) return null;
    const start = dragAnchor < dragHover ? dragAnchor : dragHover;
    const end = dragAnchor < dragHover ? dragHover : dragAnchor;
    return { start: toISODate(start), end: toISODate(end) };
  }, [isDragging, dragAnchor, dragHover]);

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
    <div className="flex h-full flex-col md:flex-row">
      <CalendarSidebar
        profiles={profiles}
        showCustody={showCustody}
        onToggleCustody={setShowCustody}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
      />

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setMonthDate((d) => subMonths(d, 1))}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <h1 className="w-28 text-base font-semibold text-white sm:w-44 sm:text-lg">
              {formatMonthTitle(monthDate)}
            </h1>
            <button
              onClick={() => setMonthDate((d) => addMonths(d, 1))}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
            <Button variant="secondary" onClick={() => setMonthDate(new Date())} className="ml-1 text-xs sm:ml-2">
              Aujourd&apos;hui
            </Button>
          </div>
          <Button onClick={() => openNewEvent(new Date())}>
            <Plus size={16} /> Créer
          </Button>
        </div>
        <p className="mb-2 hidden text-xs text-slate-500 sm:block">
          Astuce : clique sur la bande de garde en haut d&apos;un jour pour changer le parent, ou clique-glisse
          sur plusieurs jours pour créer un événement qui s&apos;étend sur toute la période.
        </p>

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
            dragRange={dragRange}
            onSelectDay={openDay}
            onSelectEvent={openEditEvent}
            onCellMouseDown={handleCellMouseDown}
            onCellMouseEnter={handleCellMouseEnter}
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
        defaultEndDate={newEventEndDate ?? selectedDay ?? new Date()}
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
