-- ============================================================
-- Give one account Pro by email (e.g. your own account, a tester, a giveaway).
-- Run in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
-- 1. Replace the email on the line marked CHANGE ME.
-- 2. Pick the plan: 'monthly' (60 scripts) or 'weekly' (15 scripts).
-- The account must already exist (sign up on the site first).
-- ============================================================

WITH target AS (
  SELECT
    lower('you@example.com') AS email,   -- CHANGE ME
    'monthly'                AS plan     -- 'monthly' or 'weekly'
)
UPDATE public.profiles p
SET
  subscription            = 'pro',
  subscription_status     = 'active',
  subscription_type       = t.plan,
  paid                    = true,
  scripts_limit           = CASE WHEN t.plan = 'monthly' THEN 60 ELSE 15 END,
  scripts_remaining       = CASE WHEN t.plan = 'monthly' THEN 60 ELSE 15 END,
  subscription_updated_at = now()
FROM target t
WHERE lower(p.email) = t.email
RETURNING p.email, p.subscription, p.subscription_type, p.scripts_remaining;

-- If this returns no rows, the email has no account yet (or is spelled
-- differently). Check with:
--   SELECT id, email, subscription, scripts_remaining FROM public.profiles WHERE email ILIKE '%part-of-your-email%';
--
-- To top up scripts later without changing the plan:
--   UPDATE public.profiles SET scripts_remaining = 60 WHERE lower(email) = lower('you@example.com');
