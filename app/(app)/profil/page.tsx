"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { useAuth } from "@/components/providers/AuthProvider";
import { PARENT_COLORS } from "@/lib/categories";
import { updateProfile } from "@/lib/data";

export default function ProfilPage() {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- intentional: seeds the form once the profile finishes loading */
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setColor(profile.color);
    }
  }, [profile]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, { display_name: displayName, color });
      await refreshProfile();
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <p className="p-6 text-sm text-slate-500">Chargement…</p>;

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Mon profil</h1>
        <p className="text-sm text-slate-400">
          Ton prénom et ta couleur, utilisés partout dans l&apos;app (bandes de garde, événements…).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div>
          <Label>Prénom affiché</Label>
          <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div>
          <Label>Couleur</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-9 rounded border border-white/10 bg-transparent"
            />
            <div className="flex gap-1">
              {PARENT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full border border-white/20"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Choisis une couleur différente de celle de l&apos;autre parent pour bien distinguer les
            bandes de garde sur le calendrier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
          {savedAt && <span className="text-xs text-slate-500">Enregistré.</span>}
        </div>
      </form>
    </div>
  );
}
