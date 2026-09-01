import type { DocumentCategory, EventCategory } from "@/types/database";

export const EVENT_CATEGORIES: Record<
  EventCategory,
  { label: string; color: string; textColor: string }
> = {
  general: { label: "Général", color: "#8b5cf6", textColor: "#ffffff" },
  special: { label: "Spécial / important", color: "#ef4444", textColor: "#ffffff" },
  holiday: { label: "Jour férié", color: "#22c55e", textColor: "#ffffff" },
  school: { label: "École", color: "#f59e0b", textColor: "#1c1300" },
  medical: { label: "Médical", color: "#06b6d4", textColor: "#00232b" },
  birthday: { label: "Anniversaire", color: "#ec4899", textColor: "#ffffff" },
};

export const DOCUMENT_CATEGORIES: Record<DocumentCategory, { label: string }> = {
  ecole: { label: "École" },
  medical: { label: "Médical" },
  legal: { label: "Légal" },
  autre: { label: "Autre" },
};

export const PARENT_COLORS = ["#3b82f6", "#ec4899", "#22c55e", "#f59e0b"];
