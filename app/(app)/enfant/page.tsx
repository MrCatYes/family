"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { DEFAULT_RESPONSIBILITIES } from "@/lib/checklist";
import {
  createResponsibility,
  deleteResponsibility,
  fetchChildProfile,
  fetchFamilySettings,
  fetchProfiles,
  fetchResponsibilities,
  saveChildProfile,
  saveFamilySettings,
  seedResponsibilities,
  updateResponsibility,
} from "@/lib/data";
import type { ChildProfile, FamilySettings, Profile, Responsibility } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";

const emptyChild: Omit<ChildProfile, "id" | "updated_at"> = {
  name: "",
  birth_date: "",
  ramq: "",
  school: "",
  grade: "",
  teacher: "",
  daycare_educator: "",
  doctor: "",
  dentist: "",
  allergies: "",
  medications: "",
  insurance_notes: "",
  vaccination_record_location: "",
  next_appointment: "",
  school_schedule: "",
  special_item: "",
  clothing_sizes: "",
  items_at_parent_a: "",
  items_at_parent_b: "",
  custody_type: "",
  transfer_time: "",
  transfer_location: "",
};

const emptySettings: Omit<FamilySettings, "id" | "updated_at" | "expense_split_percent_a"> = {
  communication_channel: "",
  sync_frequency: "",
  emergency_contact_notes: "",
};

export default function EnfantPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [childId, setChildId] = useState<string | null>(null);
  const [child, setChild] = useState(emptyChild);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [settings, setSettings] = useState(emptySettings);
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function load() {
    try {
      const [p, c, s, r] = await Promise.all([
        fetchProfiles(),
        fetchChildProfile(),
        fetchFamilySettings(),
        fetchResponsibilities(),
      ]);
      setProfiles(p);
      if (c) {
        setChildId(c.id);
        setChild({ ...emptyChild, ...c });
      }
      if (s) {
        setSettingsId(s.id);
        setSettings({ ...emptySettings, ...s });
      }
      setResponsibilities(r);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setField<K extends keyof typeof child>(key: K, value: string) {
    setChild((c) => ({ ...c, [key]: value }));
  }

  function setSettingsField<K extends keyof typeof settings>(key: K, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        // birth_date is a `date` column — Postgres rejects "" (only accepts a real date or null)
        saveChildProfile(childId, { ...child, birth_date: child.birth_date || null }),
        saveFamilySettings(settingsId, settings),
      ]);
      await load();
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  async function handleSeedResponsibilities() {
    await seedResponsibilities(DEFAULT_RESPONSIBILITIES);
    await load();
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    await createResponsibility(newTask.trim(), responsibilities.length);
    setNewTask("");
    await load();
  }

  const parentA = profiles[0];
  const parentB = profiles[1];

  if (loading) return <p className="p-6 text-sm text-slate-500">Chargement…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 pb-16">
      <div>
        <h1 className="text-lg font-semibold text-white">Fiche enfant</h1>
        <p className="text-sm text-slate-400">
          Coordonnées, santé, école et effets — utile en un coup d&apos;œil pour les deux parents.
        </p>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        <Section title="Infos essentielles">
          <Grid>
            <Field label="Nom">
              <Input value={child.name ?? ""} onChange={(e) => setField("name", e.target.value)} />
            </Field>
            <Field label="Date de naissance">
              <Input
                type="date"
                value={child.birth_date ?? ""}
                onChange={(e) => setField("birth_date", e.target.value)}
              />
            </Field>
            <Field label="NAM (RAMQ)">
              <Input value={child.ramq ?? ""} onChange={(e) => setField("ramq", e.target.value)} />
            </Field>
            <Field label="École">
              <Input value={child.school ?? ""} onChange={(e) => setField("school", e.target.value)} />
            </Field>
            <Field label="Niveau">
              <Input value={child.grade ?? ""} onChange={(e) => setField("grade", e.target.value)} />
            </Field>
            <Field label="Enseignant(e)">
              <Input value={child.teacher ?? ""} onChange={(e) => setField("teacher", e.target.value)} />
            </Field>
            <Field label="Éducatrice / service de garde">
              <Input
                value={child.daycare_educator ?? ""}
                onChange={(e) => setField("daycare_educator", e.target.value)}
              />
            </Field>
          </Grid>
        </Section>

        <Section title="Santé">
          <Grid>
            <Field label="Médecin de famille">
              <Input value={child.doctor ?? ""} onChange={(e) => setField("doctor", e.target.value)} />
            </Field>
            <Field label="Dentiste">
              <Input value={child.dentist ?? ""} onChange={(e) => setField("dentist", e.target.value)} />
            </Field>
            <Field label="Prochain / dernier rendez-vous">
              <Input
                value={child.next_appointment ?? ""}
                onChange={(e) => setField("next_appointment", e.target.value)}
              />
            </Field>
            <Field label="Carnet de vaccination — où il se trouve">
              <Input
                value={child.vaccination_record_location ?? ""}
                onChange={(e) => setField("vaccination_record_location", e.target.value)}
              />
            </Field>
          </Grid>
          <Field label="Allergies" full>
            <Textarea value={child.allergies ?? ""} onChange={(e) => setField("allergies", e.target.value)} />
          </Field>
          <Field label="Médicaments réguliers" full>
            <Textarea
              value={child.medications ?? ""}
              onChange={(e) => setField("medications", e.target.value)}
            />
          </Field>
          <Field label="Assurance médicaments (qui couvre quoi)" full>
            <Textarea
              value={child.insurance_notes ?? ""}
              onChange={(e) => setField("insurance_notes", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="École et activités">
          <Field label="Horaire de l'école, journées pédagogiques, activités parascolaires, routines (devoirs, sac d'école)" full>
            <Textarea
              value={child.school_schedule ?? ""}
              onChange={(e) => setField("school_schedule", e.target.value)}
              className="min-h-28"
            />
          </Field>
        </Section>

        <Section title="Vêtements et effets">
          <Grid>
            <Field label="Tailles actuelles (vêtements, souliers)">
              <Input
                value={child.clothing_sizes ?? ""}
                onChange={(e) => setField("clothing_sizes", e.target.value)}
              />
            </Field>
            <Field label="Doudou / objet spécial à ne pas oublier">
              <Input
                value={child.special_item ?? ""}
                onChange={(e) => setField("special_item", e.target.value)}
              />
            </Field>
            <Field label={`Ce qui reste toujours chez ${parentA?.display_name ?? "parent A"}`}>
              <Input
                value={child.items_at_parent_a ?? ""}
                onChange={(e) => setField("items_at_parent_a", e.target.value)}
              />
            </Field>
            <Field label={`Ce qui reste toujours chez ${parentB?.display_name ?? "parent B"}`}>
              <Input
                value={child.items_at_parent_b ?? ""}
                onChange={(e) => setField("items_at_parent_b", e.target.value)}
              />
            </Field>
          </Grid>
        </Section>

        <Section title="Calendrier et transferts">
          <Grid>
            <Field label="Type de garde (ex. 2-2-3, semaine/semaine)">
              <Input
                value={child.custody_type ?? ""}
                onChange={(e) => setField("custody_type", e.target.value)}
              />
            </Field>
            <Field label="Jour et heure habituels de transfert">
              <Input
                value={child.transfer_time ?? ""}
                onChange={(e) => setField("transfer_time", e.target.value)}
              />
            </Field>
            <Field label="Lieu de transfert">
              <Input
                value={child.transfer_location ?? ""}
                onChange={(e) => setField("transfer_location", e.target.value)}
              />
            </Field>
          </Grid>
          <p className="text-xs text-slate-500">
            Le motif d&apos;alternance et les exceptions se configurent dans la page{" "}
            <span className="text-slate-300">Garde</span>.
          </p>
        </Section>

        <Section title="Communication">
          <Grid>
            <Field label="Canal dédié pour les infos pratiques (texto, app…)">
              <Input
                value={settings.communication_channel ?? ""}
                onChange={(e) => setSettingsField("communication_channel", e.target.value)}
              />
            </Field>
            <Field label="Fréquence du point de synchronisation">
              <Input
                value={settings.sync_frequency ?? ""}
                onChange={(e) => setSettingsField("sync_frequency", e.target.value)}
              />
            </Field>
          </Grid>
          <Field label="Urgences seulement — comment on se contacte" full>
            <Textarea
              value={settings.emergency_contact_notes ?? ""}
              onChange={(e) => setSettingsField("emergency_contact_notes", e.target.value)}
            />
          </Field>
        </Section>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer la fiche"}
          </Button>
          {savedAt && <span className="text-xs text-slate-500">Enregistré.</span>}
        </div>
      </form>

      <Section title="Qui s'occupe de quoi">
        {responsibilities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-4">
            <p className="mb-3 text-sm text-slate-400">Aucune tâche définie.</p>
            <Button variant="secondary" onClick={handleSeedResponsibilities}>
              Utiliser la liste de tâches courantes
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {responsibilities.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
              >
                <span className="text-sm text-slate-200">{r.task}</span>
                <div className="flex items-center gap-2">
                  <Select
                    value={r.parent_id ?? ""}
                    onChange={async (e) => {
                      await updateResponsibility(r.id, { parent_id: e.target.value || null });
                      await load();
                    }}
                    className="w-40"
                  >
                    <option value="">Non assigné</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.display_name}
                      </option>
                    ))}
                  </Select>
                  <button
                    onClick={async () => {
                      await deleteResponsibility(r.id);
                      await load();
                    }}
                    className="rounded p-1.5 text-slate-500 hover:bg-white/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAddTask} className="flex gap-2 pt-1">
          <Input
            placeholder="Ajouter une tâche…"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            <Plus size={16} />
          </Button>
        </form>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-white/5 pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
