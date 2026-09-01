"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { UploadModal } from "@/components/documents/UploadModal";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { DOCUMENT_CATEGORIES } from "@/lib/categories";
import {
  deleteDocument,
  fetchDocuments,
  fetchProfiles,
  getDocumentUrl,
  uploadDocument,
} from "@/lib/data";
import type { DocumentCategory, FamilyDocument, Profile } from "@/types/database";

export default function DocumentsPage() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<FamilyDocument[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | "all">("all");

  async function load() {
    try {
      const [docs, profs] = await Promise.all([fetchDocuments(), fetchProfiles()]);
      setDocuments(docs);
      setProfiles(profs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);

  const filtered = documents.filter((d) => {
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleOpen(doc: FamilyDocument) {
    // Open the tab synchronously (within the click's user-activation window) so browsers
    // don't treat it as a popup, then point it at the signed URL once it's fetched.
    // `noopener` would make window.open return null, so sever window.opener manually instead.
    const tab = window.open();
    if (tab) tab.opener = null;
    const url = await getDocumentUrl(doc.storage_path);
    if (tab) tab.location.href = url;
  }

  async function handleDelete(doc: FamilyDocument) {
    if (!confirm(`Supprimer « ${doc.title} » ?`)) return;
    await deleteDocument(doc.id, doc.storage_path);
    await load();
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Documents</h1>
          <p className="text-sm text-slate-400">Fiches école, documents médicaux, papiers légaux…</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus size={16} /> Téléverser
        </Button>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as DocumentCategory | "all")}
          className="w-48"
        >
          <option value="all">Toutes les catégories</option>
          {(Object.keys(DOCUMENT_CATEGORIES) as DocumentCategory[]).map((cat) => (
            <option key={cat} value={cat}>
              {DOCUMENT_CATEGORIES[cat].label}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">Aucun document.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              uploader={profileMap.get(doc.uploaded_by ?? "")}
              onOpen={() => handleOpen(doc)}
              onDelete={() => handleDelete(doc)}
            />
          ))}
        </div>
      )}

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={async (file, title, description, category) => {
          if (!profile) throw new Error("Profil non chargé.");
          await uploadDocument(file, { title, description, category, uploadedBy: profile.id });
          await load();
        }}
      />
    </div>
  );
}
