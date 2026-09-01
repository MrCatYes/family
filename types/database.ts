export type EventCategory =
  | "general"
  | "special"
  | "holiday"
  | "school"
  | "medical"
  | "birthday";

export type DocumentCategory = "ecole" | "medical" | "legal" | "autre";

export type Profile = {
  id: string;
  display_name: string;
  color: string;
  created_at: string;
};

export type FamilyEvent = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
  category: EventCategory;
  color: string | null;
  created_by: string | null;
  created_at: string;
};

export type CustodyPatternType = "alternating" | "weekly_template";

/**
 * "a" / "b" — the whole day with one parent.
 * "a-b" — transfer day: parent A has the morning, parent B the afternoon/evening.
 * "b-a" — transfer day: parent B has the morning, parent A the afternoon/evening.
 */
export type CustodyDayParent = "a" | "b" | "a-b" | "b-a";

/** weeks[weekIndex][dayOfWeek] where dayOfWeek is 0=Sun..6=Sat */
export type WeeklyTemplate = {
  weeks: CustodyDayParent[][];
};

export type CustodyPattern = {
  id: string;
  start_date: string;
  parent_a_id: string;
  parent_b_id: string;
  cycle_days: number;
  pattern_type: CustodyPatternType;
  weekly_template: WeeklyTemplate | null;
  updated_at: string;
};

export type CustodyOverride = {
  id: string;
  date: string;
  /** Morning parent (or the whole-day parent, when pm_parent_id is null/same). */
  parent_id: string;
  /** Set only for a half-day transfer exception; the afternoon/evening parent. */
  pm_parent_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

export type FamilyDocument = {
  id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
};

export type Note = {
  id: string;
  content: string;
  done: boolean;
  created_by: string | null;
  created_at: string;
};

export type Contact = {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
};

export type ChildProfile = {
  id: string;
  name: string | null;
  birth_date: string | null;
  ramq: string | null;
  school: string | null;
  grade: string | null;
  teacher: string | null;
  daycare_educator: string | null;
  doctor: string | null;
  dentist: string | null;
  allergies: string | null;
  medications: string | null;
  insurance_notes: string | null;
  vaccination_record_location: string | null;
  next_appointment: string | null;
  school_schedule: string | null;
  special_item: string | null;
  clothing_sizes: string | null;
  items_at_parent_a: string | null;
  items_at_parent_b: string | null;
  custody_type: string | null;
  transfer_time: string | null;
  transfer_location: string | null;
  updated_at: string;
};

export type FamilySettings = {
  id: string;
  communication_channel: string | null;
  sync_frequency: string | null;
  emergency_contact_notes: string | null;
  expense_split_percent_a: number;
  updated_at: string;
};

export type Responsibility = {
  id: string;
  task: string;
  parent_id: string | null;
  notes: string | null;
  sort_order: number;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  paid_by: string | null;
  category: string | null;
  expense_date: string;
  reimbursed: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type MonthlyChecklistItem = {
  id: string;
  month: string;
  item_key: string;
  checked: boolean;
  updated_at: string;
};

export type MonthlyNote = {
  id: string;
  month: string;
  content: string | null;
  updated_at: string;
};

type NoRelationships = { Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      } & NoRelationships;
      events: {
        Row: FamilyEvent;
        Insert: Omit<FamilyEvent, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<FamilyEvent>;
      } & NoRelationships;
      custody_pattern: {
        Row: CustodyPattern;
        Insert: Omit<CustodyPattern, "id" | "updated_at"> & { id?: string; updated_at?: string };
        Update: Partial<CustodyPattern>;
      } & NoRelationships;
      custody_overrides: {
        Row: CustodyOverride;
        Insert: Omit<CustodyOverride, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<CustodyOverride>;
      } & NoRelationships;
      documents: {
        Row: FamilyDocument;
        Insert: Omit<FamilyDocument, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<FamilyDocument>;
      } & NoRelationships;
      notes: {
        Row: Note;
        Insert: Omit<Note, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Note>;
      } & NoRelationships;
      contacts: {
        Row: Contact;
        Insert: Omit<Contact, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Contact>;
      } & NoRelationships;
      child_profile: {
        Row: ChildProfile;
        Insert: Partial<ChildProfile>;
        Update: Partial<ChildProfile>;
      } & NoRelationships;
      family_settings: {
        Row: FamilySettings;
        Insert: Partial<FamilySettings>;
        Update: Partial<FamilySettings>;
      } & NoRelationships;
      responsibilities: {
        Row: Responsibility;
        Insert: Omit<Responsibility, "id"> & { id?: string };
        Update: Partial<Responsibility>;
      } & NoRelationships;
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Expense>;
      } & NoRelationships;
      monthly_checklist: {
        Row: MonthlyChecklistItem;
        Insert: Omit<MonthlyChecklistItem, "id" | "updated_at"> & { id?: string; updated_at?: string };
        Update: Partial<MonthlyChecklistItem>;
      } & NoRelationships;
      monthly_notes: {
        Row: MonthlyNote;
        Insert: Omit<MonthlyNote, "id" | "updated_at"> & { id?: string; updated_at?: string };
        Update: Partial<MonthlyNote>;
      } & NoRelationships;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
