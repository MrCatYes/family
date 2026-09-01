import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  ChildProfile,
  Contact,
  CustodyOverride,
  CustodyPattern,
  Expense,
  FamilyDocument,
  FamilyEvent,
  FamilySettings,
  MonthlyChecklistItem,
  MonthlyNote,
  Note,
  Profile,
  Responsibility,
} from "@/types/database";

// --- Profiles ---

export async function fetchProfiles(): Promise<Profile[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function updateProfile(id: string, patch: Partial<Profile>) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) throw error;
}

// --- Events ---

export async function fetchEventsInRange(startISO: string, endISO: string): Promise<FamilyEvent[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .lte("start_at", endISO)
    .gte("end_at", startISO)
    .order("start_at");
  if (error) throw error;
  return data ?? [];
}

export async function createEvent(event: Omit<FamilyEvent, "id" | "created_at">) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("events").insert(event);
  if (error) throw error;
}

export async function updateEvent(id: string, patch: Partial<FamilyEvent>) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("events").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

// --- Custody ---

export async function fetchCustodyPattern(): Promise<CustodyPattern | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("custody_pattern")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function saveCustodyPattern(
  existingId: string | null,
  pattern: Omit<CustodyPattern, "id" | "updated_at">
) {
  const supabase = getSupabaseClient();
  if (existingId) {
    const { error } = await supabase
      .from("custody_pattern")
      .update({ ...pattern, updated_at: new Date().toISOString() })
      .eq("id", existingId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("custody_pattern").insert(pattern);
    if (error) throw error;
  }
}

export async function fetchCustodyOverrides(startISO: string, endISO: string): Promise<CustodyOverride[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("custody_overrides")
    .select("*")
    .gte("date", startISO)
    .lte("date", endISO);
  if (error) throw error;
  return data ?? [];
}

export async function upsertCustodyOverride(override: Omit<CustodyOverride, "id" | "created_at">) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("custody_overrides")
    .upsert(override, { onConflict: "date" });
  if (error) throw error;
}

export async function deleteCustodyOverride(date: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("custody_overrides").delete().eq("date", date);
  if (error) throw error;
}

// --- Documents ---

export async function fetchDocuments(): Promise<FamilyDocument[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadDocument(
  file: File,
  meta: { title: string; description: string; category: FamilyDocument["category"]; uploadedBy: string }
) {
  const supabase = getSupabaseClient();
  const path = `${meta.uploadedBy}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("family-documents").upload(path, file);
  if (uploadError) throw uploadError;

  const { error } = await supabase.from("documents").insert({
    title: meta.title,
    description: meta.description || null,
    category: meta.category,
    storage_path: path,
    mime_type: file.type || null,
    size_bytes: file.size,
    uploaded_by: meta.uploadedBy,
  });
  if (error) throw error;
}

export async function getDocumentUrl(storagePath: string): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from("family-documents")
    .createSignedUrl(storagePath, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocument(id: string, storagePath: string) {
  const supabase = getSupabaseClient();
  const { error: storageError } = await supabase.storage.from("family-documents").remove([storagePath]);
  if (storageError) throw storageError;
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}

// --- Notes ---

export async function fetchNotes(): Promise<Note[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createNote(content: string, createdBy: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("notes").insert({ content, created_by: createdBy, done: false });
  if (error) throw error;
}

export async function toggleNote(id: string, done: boolean) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("notes").update({ done }).eq("id", id);
  if (error) throw error;
}

export async function deleteNote(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}

// --- Contacts ---

export async function fetchContacts(): Promise<Contact[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("contacts").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createContact(contact: Omit<Contact, "id" | "created_at">) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("contacts").insert(contact);
  if (error) throw error;
}

export async function deleteContact(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) throw error;
}

// --- Child profile ---

export async function fetchChildProfile(): Promise<ChildProfile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("child_profile")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function saveChildProfile(existingId: string | null, patch: Partial<ChildProfile>) {
  const supabase = getSupabaseClient();
  if (existingId) {
    const { error } = await supabase
      .from("child_profile")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", existingId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("child_profile").insert(patch);
    if (error) throw error;
  }
}

// --- Family settings ---

export async function fetchFamilySettings(): Promise<FamilySettings | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("family_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function saveFamilySettings(existingId: string | null, patch: Partial<FamilySettings>) {
  const supabase = getSupabaseClient();
  if (existingId) {
    const { error } = await supabase
      .from("family_settings")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", existingId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("family_settings").insert(patch);
    if (error) throw error;
  }
}

// --- Responsibilities ---

export async function fetchResponsibilities(): Promise<Responsibility[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("responsibilities").select("*").order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function seedResponsibilities(tasks: string[]) {
  const supabase = getSupabaseClient();
  const rows = tasks.map((task, i) => ({ task, sort_order: i, parent_id: null, notes: null }));
  const { error } = await supabase.from("responsibilities").insert(rows);
  if (error) throw error;
}

export async function updateResponsibility(id: string, patch: Partial<Responsibility>) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("responsibilities").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createResponsibility(task: string, sortOrder: number) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("responsibilities")
    .insert({ task, sort_order: sortOrder, parent_id: null, notes: null });
  if (error) throw error;
}

export async function deleteResponsibility(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("responsibilities").delete().eq("id", id);
  if (error) throw error;
}

// --- Expenses ---

export async function fetchExpenses(): Promise<Expense[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createExpense(expense: Omit<Expense, "id" | "created_at">) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("expenses").insert(expense);
  if (error) throw error;
}

export async function updateExpense(id: string, patch: Partial<Expense>) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("expenses").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteExpense(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

// --- Monthly checklist ---

export async function fetchMonthlyChecklist(month: string): Promise<MonthlyChecklistItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("monthly_checklist").select("*").eq("month", month);
  if (error) throw error;
  return data ?? [];
}

export async function setChecklistItem(month: string, itemKey: string, checked: boolean) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("monthly_checklist")
    .upsert(
      { month, item_key: itemKey, checked, updated_at: new Date().toISOString() },
      { onConflict: "month,item_key" }
    );
  if (error) throw error;
}

export async function fetchMonthlyNote(month: string): Promise<MonthlyNote | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("monthly_notes")
    .select("*")
    .eq("month", month)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function saveMonthlyNote(month: string, content: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("monthly_notes")
    .upsert({ month, content, updated_at: new Date().toISOString() }, { onConflict: "month" });
  if (error) throw error;
}
