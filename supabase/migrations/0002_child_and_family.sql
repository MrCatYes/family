-- Child profile, family coordination settings, shared expenses, task responsibilities,
-- and the monthly "don't forget" checklist. Additive to 0001_init.sql — run this second.

create table public.child_profile (
  id uuid primary key default gen_random_uuid(),
  name text,
  birth_date date,
  ramq text,
  school text,
  grade text,
  teacher text,
  daycare_educator text,
  doctor text,
  dentist text,
  allergies text,
  medications text,
  insurance_notes text,
  vaccination_record_location text,
  next_appointment text,
  school_schedule text,
  special_item text,
  clothing_sizes text,
  items_at_parent_a text,
  items_at_parent_b text,
  custody_type text,
  transfer_time text,
  transfer_location text,
  updated_at timestamptz not null default now()
);

create table public.family_settings (
  id uuid primary key default gen_random_uuid(),
  communication_channel text,
  sync_frequency text,
  emergency_contact_notes text,
  expense_split_percent_a int not null default 50,
  updated_at timestamptz not null default now()
);

create table public.responsibilities (
  id uuid primary key default gen_random_uuid(),
  task text not null,
  parent_id uuid references public.profiles(id) on delete set null,
  notes text,
  sort_order int not null default 0
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric(10,2) not null,
  paid_by uuid references public.profiles(id) on delete set null,
  category text,
  expense_date date not null default current_date,
  reimbursed boolean not null default false,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.monthly_checklist (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  item_key text not null,
  checked boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (month, item_key)
);

create table public.monthly_notes (
  id uuid primary key default gen_random_uuid(),
  month text not null unique,
  content text,
  updated_at timestamptz not null default now()
);

alter table public.child_profile enable row level security;
alter table public.family_settings enable row level security;
alter table public.responsibilities enable row level security;
alter table public.expenses enable row level security;
alter table public.monthly_checklist enable row level security;
alter table public.monthly_notes enable row level security;

create policy "child_profile full access for family" on public.child_profile
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "family_settings full access for family" on public.family_settings
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "responsibilities full access for family" on public.responsibilities
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "expenses full access for family" on public.expenses
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "monthly_checklist full access for family" on public.monthly_checklist
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "monthly_notes full access for family" on public.monthly_notes
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
