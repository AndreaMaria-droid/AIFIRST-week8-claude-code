-- Migration: Make email field required in leads table
-- Date: 2026-01-05
-- Description: Changes email column from nullable to NOT NULL

-- IMPORTANT: Before running this migration, ensure all existing leads have email addresses
-- You can check with: SELECT COUNT(*) FROM leads WHERE email IS NULL;

-- If you have leads without email, either:
-- 1. Delete them: DELETE FROM leads WHERE email IS NULL;
-- 2. Add placeholder emails: UPDATE leads SET email = 'unknown_' || id::text || '@placeholder.com' WHERE email IS NULL;

-- Make email column required
ALTER TABLE leads
ALTER COLUMN email SET NOT NULL;
