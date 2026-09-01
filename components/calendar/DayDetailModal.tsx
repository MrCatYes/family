"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { EVENT_CATEGORIES } from "@/lib/categories";
import type { CustodyOverride, FamilyEvent, Profile } from "@/types/database";
import { Pencil, Plus, Trash2 } from "lucide-react";

export function DayDetailModal({
  open,
  onClose,
  date,
  events,
  profiles,
  custodyAmId,
  custodyPmId,
  override,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onSetOverride,
  onClearOverride,
}: {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  events: FamilyEvent[];
  profiles: Profile[];
  custodyAmId: string | null;
  custodyPmId: string | null;
  override: CustodyOverride | null;
  onAddEvent: () => void;
  onEditEvent: (event: FamilyEvent) => void;
  onDeleteEvent: (id: string) => void;
  onSetOverride: (amParentId: string, pmParentId: string, note: string) => Promise<void>;
  onClearOverride: () => Promise<void>;
}) {
  const [overrideNote, setOverrideNote] = useState("");
  const [savingOverride, setSavingOverride] = useState(false);
  const [transferMode, setTransferMode] = useState(false);
  const [transferAm, setTransferAm] = useState("");
  const [transferPm, setTransferPm] = useState("");

  const isSplit = custodyAmId && custodyPmId && custodyAmId !== custodyPmId;

  if (!date) return null;

  return (
    <Modal open={open} onClose={onClose} title={format(date, "EEEE d MMMM yyyy", { locale: fr })}>
      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Événements</p>
            <Button variant="secondary" onClick={onAddEvent} className="!px-2 !py-1 text-xs">
              <Plus size={14} /> Ajouter
            </Button>
          </div>
          {events.length === 0 && <p className="text-sm text-slate-500">Aucun événement ce jour-là.</p>}
          <ul className="space-y-1.5">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-lg px-2 py-1.5"
                style={{ backgroundColor: `${event.color || EVENT_CATEGORIES[event.category].color}20` }}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{event.title}</p>
                  <p className="text-xs text-slate-400">{EVENT_CATEGORIES[event.category].label}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => onEditEvent(event)}
                    className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Garde ce jour-là</p>
          {isSplit && !transferMode && (
            <p className="mb-2 text-xs text-slate-400">
              Actuellement : {profiles.find((p) => p.id === custodyAmId)?.display_name} le matin,{" "}
              {profiles.find((p) => p.id === custodyPmId)?.display_name} le soir.
            </p>
          )}
          {!transferMode && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={async () => {
                      setSavingOverride(true);
                      try {
                        await onSetOverride(p.id, p.id, overrideNote);
                      } finally {
                        setSavingOverride(false);
                      }
                    }}
                    disabled={savingOverride}
                    className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                      !isSplit && custodyAmId === p.id ? "text-white" : "text-slate-300 opacity-60"
                    }`}
                    style={{ backgroundColor: p.color }}
                  >
                    {p.display_name} (journée complète)
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setTransferAm(custodyAmId ?? profiles[0]?.id ?? "");
                  setTransferPm(custodyPmId ?? profiles[1]?.id ?? profiles[0]?.id ?? "");
                  setTransferMode(true);
                }}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
              >
                + Transfert en demi-journée
              </button>
            </div>
          )}
          {transferMode && (
            <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Matin</label>
                  <select
                    value={transferAm}
                    onChange={(e) => setTransferAm(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Soir</label>
                  <select
                    value={transferPm}
                    onChange={(e) => setTransferPm(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferMode(false)}
                  className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <Button
                  type="button"
                  className="!px-2 !py-1 text-xs"
                  disabled={savingOverride}
                  onClick={async () => {
                    setSavingOverride(true);
                    try {
                      await onSetOverride(transferAm, transferPm, overrideNote);
                      setTransferMode(false);
                    } finally {
                      setSavingOverride(false);
                    }
                  }}
                >
                  Enregistrer le transfert
                </Button>
              </div>
            </div>
          )}
          {override && (
            <button
              onClick={onClearOverride}
              className="mt-2 text-xs text-slate-400 underline hover:text-slate-200"
            >
              Retirer l&apos;exception (revenir au motif habituel)
            </button>
          )}
          <input
            placeholder="Note (optionnel, ex. « souper jusqu'à 18h30 »)"
            value={overrideNote}
            onChange={(e) => setOverrideNote(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </Modal>
  );
}
