"use client";

import { useEffect, useState } from "react";
import { addMonths, format, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTHLY_CHECKLIST_TEMPLATE } from "@/lib/checklist";
import { Textarea } from "@/components/ui/Field";
import {
  fetchMonthlyChecklist,
  fetchMonthlyNote,
  saveMonthlyNote,
  setChecklistItem,
} from "@/lib/data";
import type { MonthlyChecklistItem } from "@/types/database";

function monthKey(date: Date) {
  return format(date, "yyyy-MM");
}

export default function SuiviPage() {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [items, setItems] = useState<MonthlyChecklistItem[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [noteSaving, setNoteSaving] = useState(false);

  const month = monthKey(monthDate);

  async function load() {
    setLoading(true);
    try {
      const [checklist, noteRow] = await Promise.all([
        fetchMonthlyChecklist(month),
        fetchMonthlyNote(month),
      ]);
      setItems(checklist);
      setNote(noteRow?.content ?? "");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: loads the checklist whenever the selected month changes
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  function isChecked(itemKey: string) {
    return items.find((i) => i.item_key === itemKey)?.checked ?? false;
  }

  async function toggleItem(itemKey: string) {
    const next = !isChecked(itemKey);
    setItems((prev) => {
      const existing = prev.find((i) => i.item_key === itemKey);
      if (existing) {
        return prev.map((i) => (i.item_key === itemKey ? { ...i, checked: next } : i));
      }
      return [
        ...prev,
        { id: itemKey, month, item_key: itemKey, checked: next, updated_at: new Date().toISOString() },
      ];
    });
    await setChecklistItem(month, itemKey, next);
  }

  async function handleNoteBlur() {
    setNoteSaving(true);
    try {
      await saveMonthlyNote(month, note);
    } finally {
      setNoteSaving(false);
    }
  }

  const totalItems = MONTHLY_CHECKLIST_TEMPLATE.reduce((sum, s) => sum + s.items.length, 0);
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Suivi mensuel</h1>
          <p className="text-sm text-slate-400">À ne pas oublier — à remplir ensemble ou en alternance.</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonthDate((d) => subMonths(d, 1))}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="w-32 text-center text-sm font-medium text-white">
            {format(monthDate, "LLLL yyyy", { locale: fr })}
          </span>
          <button
            onClick={() => setMonthDate((d) => addMonths(d, 1))}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : (
        <>
          <p className="text-xs text-slate-500">
            {checkedCount} / {totalItems} complétés ce mois-ci
          </p>

          <div className="space-y-5">
            {MONTHLY_CHECKLIST_TEMPLATE.map((section) => (
              <div key={section.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="mb-2 text-sm font-semibold text-white">{section.label}</h2>
                <div className="space-y-1.5">
                  {section.items.map((item) => (
                    <label
                      key={item.key}
                      className="flex cursor-pointer items-start gap-2 text-sm text-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked(item.key)}
                        onChange={() => toggleItem(item.key)}
                        className="mt-0.5 rounded border-white/20 bg-transparent"
                      />
                      <span className={isChecked(item.key) ? "text-slate-500 line-through" : ""}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-white">Notes du mois</h2>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Tout ce qui ne rentre pas dans les cases ci-dessus…"
              className="min-h-24"
            />
            {noteSaving && <p className="mt-1 text-xs text-slate-500">Enregistrement…</p>}
          </div>
        </>
      )}
    </div>
  );
}
