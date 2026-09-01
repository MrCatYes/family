-- Family app schema: profiles, events, custody pattern/overrides, documents
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

-- One row per parent account, linked 1:1 to an auth.users row
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  color text not null default '#3b82f6', -- hex color for custody bands / avatar
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default true,
  category text not null default 'general'
    check (category in ('general','special','holiday','school','medical','birthday')),
  color text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index events_start_at_idx on public.events (start_at);

-- Recurring custody pattern: alternates between parent_a and parent_b every `cycle_days`
create table public.custody_pattern (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  parent_a_id uuid not null references public.profiles(id) on delete cascade,
  parent_b_id uuid not null references public.profiles(id) on delete cascade,
  cycle_days int not null default 7,
  updated_at timestamptz not null default now()
);

-- One-off exceptions to the pattern (e.g. a swapped day, a dinner visit)
create table public.custody_overrides (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'autre'
    check (category in ('ecole','medical','legal','autre')),
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  done boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text, -- e.g. "École", "Pédiatre", "Urgence"
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

-- Storage bucket for document files (private)
insert into storage.buckets (id, name, public)
values ('family-documents', 'family-documents', false)
on conflict (id) do nothing;

-- RLS: any authenticated family member (i.e. has a row in profiles) can read/write everything.
-- This is a 2-person shared household app, not a multi-tenant system.
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.custody_pattern enable row level security;
alter table public.custody_overrides enable row level security;
alter table public.documents enable row level security;
alter table public.notes enable row level security;
alter table public.contacts enable row level security;

create policy "profiles readable by family" on public.profiles
  for select using (auth.uid() is not null);
create policy "profiles editable by self" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles insertable by self" on public.profiles
  for insert with check (auth.uid() = id);

create policy "events full access for family" on public.events
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "custody_pattern full access for family" on public.custody_pattern
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "custody_overrides full access for family" on public.custody_overrides
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "documents full access for family" on public.documents
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "notes full access for family" on public.notes
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "contacts full access for family" on public.contacts
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Storage RLS: any authenticated family member can read/write files in the bucket
create policy "family documents readable" on storage.objects
  for select using (bucket_id = 'family-documents' and auth.uid() is not null);
create policy "family documents insertable" on storage.objects
  for insert with check (bucket_id = 'family-documents' and auth.uid() is not null);
create policy "family documents deletable" on storage.objects
  for delete using (bucket_id = 'family-documents' and auth.uid() is not null);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
