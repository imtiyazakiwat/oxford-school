-- Migration: Fix record_fee_payment function search_path vulnerability
-- Created: December 28, 2025
-- Priority: CRITICAL - Must apply before production
-- Issue: SECURITY DEFINER function without search_path allows search_path manipulation attacks

-- =============================================================================
-- VULNERABILITY DESCRIPTION
-- =============================================================================
-- The record_fee_payment function is SECURITY DEFINER but does not have
-- search_path set. This allows an attacker to:
-- 1. Create a malicious is_admin() function in a schema they control
-- 2. Manipulate their session's search_path to include their schema first
-- 3. When record_fee_payment calls is_admin(), it may call the attacker's function
-- 4. Attacker's function returns true, bypassing authorization
--
-- This is a well-known PostgreSQL security issue documented at:
-- https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY

-- =============================================================================
-- FIX: Set search_path on the function
-- =============================================================================
ALTER FUNCTION public.record_fee_payment(uuid, uuid, numeric, date, text, text)
SET search_path = public;

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- After applying this migration, verify with:
-- SELECT proconfig FROM pg_proc WHERE proname = 'record_fee_payment';
-- Expected result: {search_path=public}

-- =============================================================================
-- SECURITY NOTES
-- =============================================================================
-- 1. All SECURITY DEFINER functions MUST have explicit search_path
-- 2. This prevents search_path manipulation attacks
-- 3. The function now explicitly uses public schema for all object references
-- 4. Combined with the existing is_admin() check, this provides defense-in-depth
