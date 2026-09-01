"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { createContact, deleteContact, fetchContacts } from "@/lib/data";
import type { Contact } from "@/types/database";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setContacts(await fetchContacts());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createContact({
        name,
        role: role || null,
        phone: phone || null,
        email: email || null,
        notes: null,
      });
      setName("");
      setRole("");
      setPhone("");
      setEmail("");
      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Contacts utiles</h1>
          <p className="text-sm text-slate-400">École, pédiatre, urgences…</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Ajouter
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-slate-500">Aucun contact.</p>
      ) : (
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li key={c.id} className="rounded-xl border border-white/5 bg-white/5 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  {c.role && <p className="text-xs text-slate-500">{c.role}</p>}
                </div>
                <button
                  onClick={async () => {
                    await deleteContact(c.id);
                    await load();
                  }}
                  className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-white">
                    <Phone size={12} /> {c.phone}
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-white">
                    <Mail size={12} /> {c.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un contact">
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <Label>Nom</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Rôle (École, Pédiatre, Urgence…)</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Courriel</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Ajouter"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
