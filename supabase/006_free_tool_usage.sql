-- Free AI video prompt tools: daily usage per visitor (no login).
-- New table + two functions only. Does not touch any existing table.
-- ip_hash is a salted SHA-256 of the visitor IP; raw IPs are never stored.

create table if not exists public.free_tool_usage (
  ip_hash    text        not null,
  day        date        not null default (now() at time zone 'utc')::date,
  count      integer     not null default 0,
  updated_at timestamptz not null default now(),
  primary key (ip_hash, day)
);

-- Locked down: no policies, so only the service role (server) can read/write.
alter table public.free_tool_usage enable row level security;

-- Atomically take one use. Returns the new count, or NULL if already at the limit.
create or replace function public.free_tool_take(p_ip_hash text, p_limit integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.free_tool_usage as u (ip_hash, day, count, updated_at)
  values (p_ip_hash, (now() at time zone 'utc')::date, 1, now())
  on conflict (ip_hash, day) do update
    set count = u.count + 1, updated_at = now()
    where u.count < p_limit
  returning u.count into v_count;
  return v_count;
end;
$$;

-- Give one use back when a generation fails.
create or replace function public.free_tool_refund(p_ip_hash text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.free_tool_usage
     set count = greatest(count - 1, 0), updated_at = now()
   where ip_hash = p_ip_hash and day = (now() at time zone 'utc')::date;
$$;

revoke all on function public.free_tool_take(text, integer) from public, anon, authenticated;
revoke all on function public.free_tool_refund(text) from public, anon, authenticated;
grant execute on function public.free_tool_take(text, integer) to service_role;
grant execute on function public.free_tool_refund(text) to service_role;

-- Optional housekeeping: old rows are useless after a day. Run now and then:
-- delete from public.free_tool_usage where day < (now() at time zone 'utc')::date - 7;
