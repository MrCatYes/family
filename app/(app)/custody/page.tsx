"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  deleteCustodyOverride,
  fetchCustodyOverrides,
  fetchCustodyPattern,
  fetchProfiles,
  saveCustodyPattern,
} from "@/lib/data";
import type { CustodyOverride, CustodyPattern, Profile } from "@/types/database";
import { Trash2 } from "lucide-react";

export default function CustodyPage() {
  const { profile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pattern, setPattern] = useState<CustodyPattern | null>(null);
  const [overrides, setOverrides] = useState<CustodyOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [parentAId, setParentAId] = useState("");
  const [parentBId, setParentBId] = useState("");
  const [cycleDays, setCycleDays] = useState(7);

  async function load() {
    try {
      const [p, pat] = await Promise.all([fetchProfiles(), fetchCustodyPattern()]);
      setProfiles(p);
      setPattern(pat);
      if (pat) {
        setStartDate(pat.start_date);
        setParentAId(pat.parent_a_id);
        setParentBId(pat.parent_b_id);
        setCycleDays(pat.cycle_days);
      } else if (p.length >= 2) {
        setParentAId(p[0].id);
        setParentBId(p[1].id);
        setStartDate(format(new Date(), "yyyy-MM-dd"));
      }
      const now = new Date();
      const from = format(new Date(now.getFullYear(), now.getMonth() - 1, 1), "yyyy-MM-dd");
      const to = format(new Date(now.getFullYear(), now.getMonth() + 3, 0), "yyyy-MM-dd");
      const ov = await fetchCustodyOverrides(from, to);
      setOverrides(ov.sort((a, b) => a.date.localeCompare(b.date)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveCustodyPattern(pattern?.id ?? null, {
        start_date: startDate,
        parent_a_id: parentAId,
        parent_b_id: parentBId,
        cycle_days: cycleDays,
      });
      await load();
    } finally {
      setSaving(false);
    }
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  if (loading) return <p className="p-6 text-sm text-slate-500">Chargement…</p>;

  if (profiles.length < 2) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-400">
          Il faut deux comptes parent créés (Maman et Papa) avant de configurer la garde. Demande à
          l&apos;autre parent de créer son compte via la page de connexion.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Réglages de garde</h1>
        <p className="text-sm text-slate-400">
          Définis le motif d&apos;alternance. Les exceptions ponctuelles se gèrent directement depuis le
          calendrier en cliquant sur un jour.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Parent A</Label>
            <Select value={parentAId} onChange={(e) => setParentAId(e.target.value)}>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Parent B</Label>
            <Select value={parentBId} onChange={(e) => setParentBId(e.target.value)}>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date de départ (Parent A commence ce jour-là)</Label>
            <Input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>Durée d&apos;un cycle (jours)</Label>
            <Input
              type="number"
              min={1}
              required
              value={cycleDays}
              onChange={(e) => setCycleDays(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-slate-500">7 = alternance chaque semaine</p>
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer le motif"}
        </Button>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-white">Exceptions à venir / récentes</h2>
        {overrides.length === 0 && (
          <p className="text-sm text-slate-500">Aucune exception. Ajoutes-en depuis le calendrier.</p>
        )}
        <ul className="space-y-1.5">
          {overrides.map((o) => {
            const parent = profileMap.get(o.parent_id);
            return (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: parent?.color ?? "#888" }}
                  />
                  <span className="text-slate-300">
                    {format(new Date(`${o.date}T00:00:00`), "d MMMM yyyy", { locale: fr })} —{" "}
                    {parent?.display_name ?? "?"}
                  </span>
                  {o.note && <span className="text-slate-500">({o.note})</span>}
                </div>
                <button
                  onClick={async () => {
                    await deleteCustodyOverride(o.date);
                    await load();
                  }}
                  className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {profile && (
        <p className="text-xs text-slate-600">Connecté en tant que {profile.display_name}.</p>
      )}
    </div>
  );
}
