-- Lets a one-off custody exception also be a half-day transfer (e.g. "exceptionally,
-- Papa has the morning and Maman the evening"), matching the weekly template feature.
-- parent_id remains the morning (or whole-day) parent; pm_parent_id is only set when
-- the exception is a half-day transfer, and defaults to matching parent_id otherwise.

alter table public.custody_overrides
  add column pm_parent_id uuid references public.profiles(id);
