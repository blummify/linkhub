-- Backfill free subscription records for all users who don't have one yet.
-- Safe to run multiple times: the WHERE NOT EXISTS guard prevents duplicates.
INSERT INTO "Subscription" (
  "id",
  "userId",
  "planId",
  "status",
  "cancelAtPeriodEnd",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  u."id",
  'free',
  'active',
  false,
  NOW(),
  NOW()
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "Subscription" s WHERE s."userId" = u."id"
);
