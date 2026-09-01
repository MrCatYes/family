export type ChecklistSection = {
  key: string;
  label: string;
  items: { key: string; label: string }[];
};

export const MONTHLY_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    key: "ecole",
    label: "École",
    items: [
      { key: "ecole_agenda", label: "Vérifier l'agenda / Portail parents cette semaine" },
      { key: "ecole_pedago", label: "Journées pédagogiques du mois — garde organisée ?" },
      { key: "ecole_comm", label: "Communications récentes de l'enseignant(e) lues par les deux ?" },
      { key: "ecole_projets", label: "Projets ou matériel spécial à venir (costume, présentation, etc.)" },
    ],
  },
  {
    key: "sante",
    label: "Santé",
    items: [
      { key: "sante_rdv", label: "Rendez-vous à prendre ou à confirmer (médecin, dentiste, optométriste)" },
      { key: "sante_vaccins", label: "Vaccins à jour ?" },
      { key: "sante_prescriptions", label: "Prescriptions à renouveler" },
      { key: "sante_saison", label: "Besoins saisonniers (crème solaire, gants, etc.)" },
    ],
  },
  {
    key: "vetements",
    label: "Vêtements",
    items: [
      { key: "vet_taille", label: "Vérifier si les vêtements/souliers font encore" },
      { key: "vet_manque", label: "Manque-t-il quelque chose (bas, sous-vêtements, pyjama) ?" },
      { key: "vet_saison", label: "Prochain changement de saison à préparer" },
    ],
  },
  {
    key: "social",
    label: "Social",
    items: [
      { key: "social_invitations", label: "Invitations de fêtes reçues — RSVP fait ? Cadeau acheté ?" },
      { key: "social_amis", label: "Jeux avec amis à organiser" },
      { key: "social_humeur", label: "Comportement/humeur — quelque chose à surveiller ou à discuter ?" },
    ],
  },
  {
    key: "activites",
    label: "Activités",
    items: [
      { key: "act_frais", label: "Frais d'activités payés" },
      { key: "act_equipement", label: "Équipement en bon état / à remplacer" },
      { key: "act_inscriptions", label: "Dates limites d'inscription à venir (prochaine saison/session)" },
    ],
  },
  {
    key: "admin",
    label: "Administratif",
    items: [
      { key: "admin_documents", label: "Documents à renouveler (RAMQ, passeport, etc.)" },
      { key: "admin_recus", label: "Reçus à conserver pour crédits d'impôt (garde, activités)" },
    ],
  },
];

export const DEFAULT_RESPONSIBILITIES = [
  "Rendez-vous médicaux/dentaires",
  "Communications avec l'école",
  "Achat de vêtements",
  "Inscription aux activités",
  "Coupe de cheveux",
  "Cadeaux d'anniversaire (amis)",
  "Costume/matériel spécial (Halloween, spectacle, etc.)",
];
