-- Auto-assigns alternating colors to new parent profiles instead of everyone getting the
-- same default blue (which made the custody calendar bands indistinguishable).

create or replace function public.handle_new_user()
returns trigger as $$
declare
  existing_count int;
  palette text[] := array['#3b82f6', '#ec4899', '#22c55e', '#f59e0b'];
begin
  select count(*) into existing_count from public.profiles;
  insert into public.profiles (id, display_name, color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    palette[(existing_count % array_length(palette, 1)) + 1]
  );
  return new;
end;
$$ language plpgsql security definer;
