import { FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { DOCUMENT_CATEGORIES } from "@/lib/categories";
import type { FamilyDocument, Profile } from "@/types/database";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function DocumentCard({
  doc,
  uploader,
  onOpen,
  onDelete,
}: {
  doc: FamilyDocument;
  uploader: Profile | undefined;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const isImage = doc.mime_type?.startsWith("image/");

  return (
    <div className="group relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-3">
      <button onClick={onOpen} className="flex flex-1 flex-col items-start gap-2 text-left">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-slate-300">
          {isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
        </div>
        <p className="line-clamp-2 text-sm font-medium text-white">{doc.title}</p>
        <p className="text-xs text-slate-500">
          {DOCUMENT_CATEGORIES[doc.category].label} · {uploader?.display_name ?? "?"} ·{" "}
          {format(new Date(doc.created_at), "d MMM yyyy", { locale: fr })}
        </p>
      </button>
      <button
        onClick={onDelete}
        className="absolute right-2 top-2 rounded p-1 text-slate-500 opacity-0 hover:bg-white/10 hover:text-red-400 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
