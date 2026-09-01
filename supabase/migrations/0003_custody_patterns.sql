-- Adds support for multiple custody schedule types: the existing simple day-count
-- alternation, plus a multi-week day-of-week template (covers 2-2-3, 2-2-5-5,
-- custom "Wed evening to Fri morning" style schedules, etc.)

alter table public.custody_pattern
  add column pattern_type text not null default 'alternating'
    check (pattern_type in ('alternating', 'weekly_template')),
  add column weekly_template jsonb;
