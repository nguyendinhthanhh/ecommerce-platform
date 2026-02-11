-- Migration V2: Remove shop references for Single-Vendor System
-- This migration removes shop_id foreign keys from products and orders tables

BEGIN;

-- 1. Remove shop_id from products table
ALTER TABLE "ecommerce-platform".products 
DROP COLUMN IF EXISTS shop_id;

-- 2. Remove shop_id from orders table
ALTER TABLE "ecommerce-platform".orders 
DROP COLUMN IF EXISTS shop_id;

-- 3. Optional: Drop shops table if you want to completely remove it
-- Uncomment the line below if you want to delete the shops table
-- DROP TABLE IF EXISTS "ecommerce-platform".shops CASCADE;

-- 4. Optional: Drop seller_id from users if SELLER role is completely removed
-- This is optional - you may want to keep the column for data history
-- ALTER TABLE "ecommerce-platform".users DROP COLUMN IF EXISTS seller_id;

COMMIT;

-- Note: After running this migration:
-- 1. All products will be owned by the single vendor (the company)
-- 2. All orders will be managed centrally by STAFF/ADMIN
-- 3. SELLER role should not be used anymore
