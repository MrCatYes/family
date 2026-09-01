"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { EVENT_CATEGORIES } from "@/lib/categories";
import { toISODate } from "@/lib/dates";
import type { EventCategory, FamilyEvent, Profile } from "@/types/database";

export function EventFormModal({
  open,
  onClose,
  defaultDate,
  defaultEndDate,
  event,
  profiles,
  currentProfileId,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
  /** End of the initial range for a new event (e.g. from a drag-select). Defaults to defaultDate. */
  defaultEndDate?: Date;
  event?: FamilyEvent | null;
  profiles: Profile[];
  currentProfileId: string;
  onSave: (data: Omit<FamilyEvent, "id" | "created_at">) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("general");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [colorOverride, setColorOverride] = useState<string>("");
  const [saving, setSaving] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- intentional: resets the form fields whenever the modal opens for a different event */
  useEffect(() => {
    if (!open) return;
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setCategory(event.category);
      setStartDate(event.start_at.slice(0, 10));
      setEndDate(event.end_at.slice(0, 10));
      setColorOverride(event.color ?? "");
    } else {
      const start = defaultDate ?? new Date();
      const end = defaultEndDate ?? start;
      setTitle("");
      setDescription("");
      setCategory("general");
      setStartDate(toISODate(start));
      setEndDate(toISODate(end));
      setColorOverride("");
    }
  }, [open, event, defaultDate, defaultEndDate]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        title,
        description: description || null,
        category,
        start_at: `${startDate}T00:00:00.000Z`,
        end_at: `${endDate}T23:59:59.000Z`,
        all_day: true,
        color: colorOverride || null,
        created_by: currentProfileId,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={event ? "Modifier l'événement" : "Nouvel événement"}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label>Titre</Label>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rendez-vous, sortie…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Début</Label>
            <Input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>Fin</Label>
            <Input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Catégorie</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}>
            {(Object.keys(EVENT_CATEGORIES) as EventCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {EVENT_CATEGORIES[cat].label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Couleur (optionnel — ex. couleur d&apos;un parent)</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorOverride || EVENT_CATEGORIES[category].color}
              onChange={(e) => setColorOverride(e.target.value)}
              className="h-9 w-9 rounded border border-white/10 bg-transparent"
            />
            <div className="flex gap-1">
              {profiles.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setColorOverride(p.color)}
                  title={p.display_name}
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ backgroundColor: p.color }}
                />
              ))}
              {colorOverride && (
                <button
                  type="button"
                  onClick={() => setColorOverride("")}
                  className="text-xs text-slate-400 underline"
                >
                  réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="flex items-center justify-between pt-2">
          {event && onDelete ? (
            <Button type="button" variant="danger" onClick={onDelete}>
              Supprimer
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
