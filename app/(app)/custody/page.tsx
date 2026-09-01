"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { useAuth } from "@/components/providers/AuthProvider";
import { CUSTODY_PRESETS, WEEKDAY_SHORT } from "@/lib/custodyPresets";
import {
  deleteCustodyOverride,
  fetchCustodyOverrides,
  fetchCustodyPattern,
  fetchProfiles,
  saveCustodyPattern,
} from "@/lib/data";
import type {
  CustodyDayParent,
  CustodyOverride,
  CustodyPattern,
  CustodyPatternType,
  Profile,
  WeeklyTemplate,
} from "@/types/database";
import { Trash2 } from "lucide-react";

function emptyWeek(): CustodyDayParent[] {
  return Array(7).fill("a") as CustodyDayParent[];
}

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
  const [patternType, setPatternType] = useState<CustodyPatternType>("alternating");
  const [cycleDays, setCycleDays] = useState(7);
  const [weeklyTemplate, setWeeklyTemplate] = useState<WeeklyTemplate>({ weeks: [emptyWeek(), emptyWeek()] });

  async function load() {
    try {
      const [p, pat] = await Promise.all([fetchProfiles(), fetchCustodyPattern()]);
      setProfiles(p);
      setPattern(pat);
      if (pat) {
        setStartDate(pat.start_date);
        setParentAId(pat.parent_a_id);
        setParentBId(pat.parent_b_id);
        setPatternType(pat.pattern_type);
        setCycleDays(pat.cycle_days);
        if (pat.weekly_template?.weeks?.length) setWeeklyTemplate(pat.weekly_template);
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
        pattern_type: patternType,
        cycle_days: cycleDays,
        weekly_template: patternType === "weekly_template" ? weeklyTemplate : null,
      });
      await load();
    } finally {
      setSaving(false);
    }
  }

  function applyPreset(key: string) {
    const preset = CUSTODY_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setWeeklyTemplate({ weeks: preset.template.weeks.map((w) => [...w]) });
  }

  function setWeeksCount(count: number) {
    setWeeklyTemplate((prev) => {
      const weeks = [...prev.weeks];
      while (weeks.length < count) weeks.push(emptyWeek());
      weeks.length = count;
      return { weeks };
    });
  }

  const DAY_CYCLE: CustodyDayParent[] = ["a", "b", "a-b", "b-a"];

  function dayAmPm(day: CustodyDayParent): { amIsA: boolean; pmIsA: boolean } {
    switch (day) {
      case "a":
        return { amIsA: true, pmIsA: true };
      case "b":
        return { amIsA: false, pmIsA: false };
      case "a-b":
        return { amIsA: true, pmIsA: false };
      case "b-a":
        return { amIsA: false, pmIsA: true };
    }
  }

  function toggleDay(weekIndex: number, dayIndex: number) {
    setWeeklyTemplate((prev) => {
      const weeks = prev.weeks.map((w) => [...w]);
      const current = weeks[weekIndex][dayIndex];
      const next = DAY_CYCLE[(DAY_CYCLE.indexOf(current) + 1) % DAY_CYCLE.length];
      weeks[weekIndex][dayIndex] = next;
      return { weeks };
    });
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const parentA = profileMap.get(parentAId);
  const parentB = profileMap.get(parentBId);

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
    <div className="mx-auto max-w-2xl space-y-8 p-6 pb-16">
      <div>
        <h1 className="text-lg font-semibold text-white">Réglages de garde</h1>
        <p className="text-sm text-slate-400">
          Définis le motif de garde. Les exceptions ponctuelles se gèrent directement depuis le
          calendrier en cliquant sur un jour.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5">
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

        <div>
          <Label>Type de motif</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPatternType("alternating")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                patternType === "alternating" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400"
              }`}
            >
              Alternance simple
            </button>
            <button
              type="button"
              onClick={() => setPatternType("weekly_template")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                patternType === "weekly_template" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400"
              }`}
            >
              Motif hebdomadaire (2-2-3, personnalisé…)
            </button>
          </div>
        </div>

        <div>
          <Label>
            {patternType === "alternating"
              ? "Date de départ (Parent A commence ce jour-là)"
              : "Date de départ (ancre le cycle sur la semaine calendrier de cette date)"}
          </Label>
          <Input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="max-w-xs" />
        </div>

        {patternType === "alternating" ? (
          <div>
            <Label>Durée d&apos;un cycle (jours)</Label>
            <Input
              type="number"
              min={1}
              required
              value={cycleDays}
              onChange={(e) => setCycleDays(Number(e.target.value))}
              className="max-w-xs"
            />
            <p className="mt-1 text-xs text-slate-500">
              7 = alternance chaque semaine. Ex. 14 = deux semaines chez chaque parent.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Modèle de départ</Label>
              <div className="flex flex-wrap gap-2">
                {CUSTODY_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyPreset(preset.key)}
                    title={preset.description}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Nombre de semaines dans le cycle</Label>
              <Input
                type="number"
                min={1}
                max={4}
                value={weeklyTemplate.weeks.length}
                onChange={(e) => setWeeksCount(Math.min(4, Math.max(1, Number(e.target.value))))}
                className="max-w-xs"
              />
            </div>

            <div>
              <Label>
                Clique sur un jour pour faire défiler {parentA?.display_name ?? "Parent A"} → {parentB?.display_name ?? "Parent B"} → journée de
                transfert ({parentA?.display_name?.slice(0, 1) ?? "A"} matin / {parentB?.display_name?.slice(0, 1) ?? "B"} soir) → l&apos;inverse
              </Label>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-1 text-center text-xs">
                  <thead>
                    <tr>
                      <th className="w-20 text-left text-slate-500"> </th>
                      {WEEKDAY_SHORT.map((d) => (
                        <th key={d} className="font-normal text-slate-500">
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyTemplate.weeks.map((week, weekIndex) => (
                      <tr key={weekIndex}>
                        <td className="text-left text-slate-400">Semaine {weekIndex + 1}</td>
                        {week.map((day, dayIndex) => {
                          const { amIsA, pmIsA } = dayAmPm(day);
                          const amWho = amIsA ? parentA : parentB;
                          const pmWho = pmIsA ? parentA : parentB;
                          const isSplit = day === "a-b" || day === "b-a";
                          return (
                            <td key={dayIndex}>
                              <button
                                type="button"
                                onClick={() => toggleDay(weekIndex, dayIndex)}
                                title={
                                  isSplit
                                    ? `Transfert : ${amWho?.display_name} le matin, ${pmWho?.display_name} le soir`
                                    : amWho?.display_name
                                }
                                className="flex h-9 w-full min-w-9 overflow-hidden rounded-md font-medium text-white"
                              >
                                <span className="flex flex-1 items-center justify-center" style={{ backgroundColor: amWho?.color ?? "#555" }}>
                                  {amWho?.display_name?.slice(0, 1) ?? "?"}
                                </span>
                                {isSplit && (
                                  <span className="flex flex-1 items-center justify-center" style={{ backgroundColor: pmWho?.color ?? "#555" }}>
                                    {pmWho?.display_name?.slice(0, 1) ?? "?"}
                                  </span>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Une case divisée en deux (ex. {parentA?.display_name?.slice(0, 1) ?? "M"}/{parentB?.display_name?.slice(0, 1) ?? "P"}) indique une
                journée de transfert : le premier parent a l&apos;enfant le matin, le second l&apos;après-midi/soir.
              </p>
            </div>
          </div>
        )}

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
