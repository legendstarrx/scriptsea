-- Run this in Supabase SQL Editor.
-- Atomic decrement for scripts_remaining — prevents going below 0.

create or replace function public.decrement_scripts_remaining(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set
    scripts_remaining  = greatest(scripts_remaining - 1, 0),
    scripts_generated  = coalesce(scripts_generated, 0) + 1
  where id = user_id;
end;
$$;
