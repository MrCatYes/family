"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  fetchFamilySettings,
  fetchProfiles,
  saveFamilySettings,
  updateExpense,
} from "@/lib/data";
import type { Expense, FamilySettings, Profile } from "@/types/database";

export default function DepensesPage() {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<FamilySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    try {
      const [ex, p, s] = await Promise.all([fetchExpenses(), fetchProfiles(), fetchFamilySettings()]);
      setExpenses(ex);
      setProfiles(p);
      setSettings(s);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const parentA = profiles[0];
  const parentB = profiles[1];
  const splitA = settings?.expense_split_percent_a ?? 50;

  const balance = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const paidByA = expenses
      .filter((e) => e.paid_by === parentA?.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const owedByA = (total * splitA) / 100;
    const diff = paidByA - owedByA; // positive: B owes A; negative: A owes B
    return { total, diff };
  }, [expenses, parentA, splitA]);

  async function handleSplitChange(value: number) {
    await saveFamilySettings(settings?.id ?? null, {
      expense_split_percent_a: value,
      communication_channel: settings?.communication_channel ?? null,
      sync_frequency: settings?.sync_frequency ?? null,
      emergency_contact_notes: settings?.emergency_contact_notes ?? null,
    });
    await load();
  }

  if (loading || !profile) return <p className="p-6 text-sm text-slate-500">Chargement…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Dépenses partagées</h1>
          <p className="text-sm text-slate-400">Fournitures, activités, vêtements…</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Ajouter
        </Button>
      </div>

      {profiles.length >= 2 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Solde</p>
          {expenses.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune dépense enregistrée.</p>
          ) : Math.abs(balance.diff) < 0.01 ? (
            <p className="text-lg font-semibold text-white">Comptes équilibrés</p>
          ) : balance.diff > 0 ? (
            <p className="text-lg font-semibold text-white">
              {parentB?.display_name} doit {balance.diff.toFixed(2)} $ à {parentA?.display_name}
            </p>
          ) : (
            <p className="text-lg font-semibold text-white">
              {parentA?.display_name} doit {Math.abs(balance.diff).toFixed(2)} $ à {parentB?.display_name}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>Partage :</span>
            <input
              type="number"
              min={0}
              max={100}
              value={splitA}
              onChange={(e) => handleSplitChange(Number(e.target.value))}
              className="w-14 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-white"
            />
            <span>
              % {parentA?.display_name} / {100 - splitA}% {parentB?.display_name}
            </span>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune dépense.</p>
      ) : (
        <ul className="space-y-1.5">
          {expenses.map((e) => {
            const payer = profiles.find((p) => p.id === e.paid_by);
            return (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{e.description}</p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(`${e.expense_date}T00:00:00`), "d MMM yyyy", { locale: fr })} ·{" "}
                    {payer?.display_name ?? "?"}
                    {e.category ? ` · ${e.category}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-medium text-white">{Number(e.amount).toFixed(2)} $</span>
                  <label className="flex items-center gap-1 text-xs text-slate-400">
                    <input
                      type="checkbox"
                      checked={e.reimbursed}
                      onChange={async (ev) => {
                        await updateExpense(e.id, { reimbursed: ev.target.checked });
                        await load();
                      }}
                      className="rounded border-white/20 bg-transparent"
                    />
                    Remboursé
                  </label>
                  <button
                    onClick={async () => {
                      await deleteExpense(e.id);
                      await load();
                    }}
                    className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ExpenseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        profiles={profiles}
        currentProfileId={profile.id}
        onSave={async (data) => {
          await createExpense(data);
          await load();
        }}
      />
    </div>
  );
}
