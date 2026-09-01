"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useAuth } from "@/components/providers/AuthProvider";
import { createNote, deleteNote, fetchNotes, fetchProfiles, toggleNote } from "@/lib/data";
import type { Note, Profile } from "@/types/database";

export default function NotesPage() {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [n, p] = await Promise.all([fetchNotes(), fetchProfiles()]);
      setNotes(n);
      setProfiles(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !profile) return;
    await createNote(content.trim(), profile.id);
    setContent("");
    await load();
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-1 text-lg font-semibold text-white">Notes partagées</h1>
      <p className="mb-4 text-sm text-slate-400">Rappels et tâches à partager entre vous deux.</p>

      <form onSubmit={handleAdd} className="mb-5 flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ajouter un rappel…"
        />
        <Button type="submit">
          <Plus size={16} />
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune note pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-1.5">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={note.done}
                onChange={async (e) => {
                  await toggleNote(note.id, e.target.checked);
                  await load();
                }}
                className="rounded border-white/20 bg-transparent"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${note.done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                  {note.content}
                </p>
                <p className="text-xs text-slate-600">
                  {profileMap.get(note.created_by ?? "")?.display_name ?? "?"} ·{" "}
                  {format(new Date(note.created_at), "d MMM", { locale: fr })}
                </p>
              </div>
              <button
                onClick={async () => {
                  await deleteNote(note.id);
                  await load();
                }}
                className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
