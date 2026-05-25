-- Run this in Supabase SQL Editor if you haven't already.
-- Adds subscription_status and polar_customer_id columns used by the webhook.

alter table public.profiles
  add column if not exists subscription_status text not null default 'inactive',
  add column if not exists polar_customer_id text,
  add column if not exists polar_subscription_id text,
  add column if not exists polar_product_id text,
  add column if not exists current_period_end timestamptz,
  add column if not exists payment_provider text;

-- Back-fill: mark anyone already flagged as pro/paid as active.
update public.profiles
set subscription_status = 'active'
where
  subscription_status = 'inactive'
  and (
    subscription = 'pro'
    or subscription = 'premium'
    or paid = true
    or scripts_limit > 0
  );
