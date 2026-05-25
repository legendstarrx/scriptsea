-- ============================================================
-- Run this in Supabase SQL Editor.
-- Fixes ALL existing pro users showing as free.
-- ============================================================

-- Step 1: Add subscription_status column (safe if already exists)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'inactive';

-- Step 2: Upgrade anyone who has a successful Polar payment record
-- but whose profile still shows free/starter
UPDATE public.profiles p
SET
  subscription        = 'pro',
  subscription_status = 'active',
  paid                = true,
  scripts_limit       = GREATEST(p.scripts_limit, CASE WHEN pay.plan_type = 'monthly' THEN 500 ELSE 100 END),
  scripts_remaining   = GREATEST(p.scripts_remaining, CASE WHEN pay.plan_type = 'monthly' THEN 500 ELSE 100 END),
  subscription_updated_at = now()
FROM (
  SELECT DISTINCT ON (user_id)
    user_id,
    plan_type
  FROM public.payments
  WHERE status = 'successful'
    AND provider = 'polar'
  ORDER BY user_id, created_at DESC
) pay
WHERE p.id = pay.user_id;

-- Step 3: Backfill subscription_status for anyone already flagged
-- as pro/paid through other means
UPDATE public.profiles
SET subscription_status = 'active'
WHERE subscription_status = 'inactive'
  AND (
    subscription = 'pro'
    OR subscription = 'premium'
    OR paid = true
    OR scripts_limit > 0
  );

-- Verify: show all profiles and their current status
SELECT id, email, subscription, subscription_status, paid, scripts_limit
FROM public.profiles
ORDER BY created_at DESC;
