-- Migration: Fix fee tables grants for authenticated role
-- Created: December 2024
-- Issue: Authenticated role only had SELECT, but RLS policies allow admin writes
-- Fix: Grant INSERT, UPDATE, DELETE to authenticated (RLS will restrict to admins)

-- =============================================================================
-- EXPLANATION
-- =============================================================================
-- In Supabase/PostgreSQL, table-level GRANTs and RLS policies work together:
-- 1. GRANTs control what operations a role CAN attempt
-- 2. RLS policies control which rows the operation affects
-- 
-- If we only GRANT SELECT, then even admins cannot INSERT/UPDATE/DELETE
-- because the operation is blocked at the GRANT level before RLS is checked.
--
-- The correct pattern is:
-- - GRANT the operations to authenticated role
-- - Use RLS policies to restrict WHO can perform those operations
--
-- This is secure because:
-- - Non-admin users will have their writes blocked by RLS (is_admin check fails)
-- - Admin users will pass the RLS check and be allowed to write

-- fee_structures: Grant write permissions (RLS restricts to admins)
GRANT INSERT, UPDATE, DELETE ON fee_structures TO authenticated;

-- fee_records: Grant write permissions (RLS restricts to admins)
GRANT INSERT, UPDATE, DELETE ON fee_records TO authenticated;

-- fee_payments: Grant write permissions (RLS restricts to admins)
GRANT INSERT, UPDATE, DELETE ON fee_payments TO authenticated;

-- fee_audit_log: NO additional grants - only SELECT allowed, RLS blocks all writes
-- This table is intentionally immutable - only the trigger function can insert
