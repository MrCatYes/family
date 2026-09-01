"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { toISODate } from "@/lib/dates";
import type { Expense, Profile } from "@/types/database";

export function ExpenseFormModal({
  open,
  onClose,
  profiles,
  currentProfileId,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  profiles: Profile[];
  currentProfileId: string;
  onSave: (data: Omit<Expense, "id" | "created_at">) => Promise<void>;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(currentProfileId);
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- intentional: resets the form fields whenever the modal opens */
  useEffect(() => {
    if (!open) return;
    setDescription("");
    setAmount("");
    setPaidBy(currentProfileId);
    setCategory("");
    setDate(toISODate(new Date()));
  }, [open, currentProfileId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        description,
        amount: Number(amount),
        paid_by: paidBy,
        category: category || null,
        expense_date: date,
        reimbursed: false,
        notes: null,
        created_by: currentProfileId,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajouter une dépense">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label>Description</Label>
          <Input
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Fournitures scolaires, activité…"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Montant ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Payé par</Label>
            <Select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Catégorie (optionnel)</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="École, activité…" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement…" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
