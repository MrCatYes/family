"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { DOCUMENT_CATEGORIES } from "@/lib/categories";
import type { DocumentCategory } from "@/types/database";

export function UploadModal({
  open,
  onClose,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, title: string, description: string, category: DocumentCategory) => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("autre");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    setError(null);
    try {
      await onUpload(file, title || file.name, description, category);
      setFile(null);
      setTitle("");
      setDescription("");
      setCategory("autre");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du téléversement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Téléverser un document">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label>Fichier</Label>
          <input
            type="file"
            required
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              if (f && !title) setTitle(f.name);
            }}
            className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-indigo-500"
          />
        </div>
        <div>
          <Label>Titre</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Catégorie</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)}>
            {(Object.keys(DOCUMENT_CATEGORIES) as DocumentCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {DOCUMENT_CATEGORIES[cat].label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Description (optionnel)</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving || !file}>
            {saving ? "Envoi…" : "Téléverser"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
