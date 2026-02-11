-- Migration: convert any existing users with status='DELETED' to status='INACTIVE'
-- Run this on your Postgres database (schema: "ecommerce-platform").
-- Use psql or your DB client. This is safe (idempotent) if no rows have status='DELETED'.

BEGIN;

-- 1) Show rows that would be changed (for review)
-- SELECT id, email, status FROM "ecommerce-platform".users WHERE status = 'DELETED';

-- 2) Convert DELETED -> INACTIVE
UPDATE "ecommerce-platform".users
SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP
WHERE status = 'DELETED';

-- 3) Optional: if your DB still has an old boolean `deleted` column and you want to remove it,
-- uncomment the next line after verifying it's safe to drop.
-- ALTER TABLE "ecommerce-platform".users DROP COLUMN IF EXISTS deleted;

COMMIT;

