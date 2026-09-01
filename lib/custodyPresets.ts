import type { CustodyDayParent, WeeklyTemplate } from "@/types/database";

export const WEEKDAY_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export type CustodyPreset = {
  key: string;
  label: string;
  description: string;
  template: WeeklyTemplate;
};

const A: CustodyDayParent = "a";
const B: CustodyDayParent = "b";

export const CUSTODY_PRESETS: CustodyPreset[] = [
  {
    key: "2-2-3",
    label: "2-2-3",
    description: "Parent A: lun-mar, Parent B: mer-jeu, alterne le week-end (3 jours). Alterne chaque semaine.",
    template: {
      weeks: [
        // Dim Lun Mar Mer Jeu Ven Sam
        [A, A, A, B, B, A, A],
        [B, B, B, A, A, B, B],
      ],
    },
  },
  {
    key: "2-2-5-5",
    label: "2-2-5-5",
    description: "Parent A: lun-mar, Parent B: mer-jeu, puis 5 jours chacun en alternance (2 semaines).",
    template: {
      weeks: [
        [A, A, A, B, B, A, A],
        [A, B, B, A, A, B, B],
      ],
    },
  },
  {
    key: "week-week",
    label: "Semaine / semaine",
    description: "Une semaine complète chez chaque parent, alternance simple (équivalent au motif par défaut).",
    template: {
      weeks: [
        [A, A, A, A, A, A, A],
        [B, B, B, B, B, B, B],
      ],
    },
  },
  {
    key: "custom",
    label: "Personnalisé",
    description: "Définis toi-même chaque jour, semaine par semaine (2 à 4 semaines).",
    template: { weeks: [Array(7).fill(A) as CustodyDayParent[]] },
  },
];
