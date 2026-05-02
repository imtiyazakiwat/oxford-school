-- Migration: Fix audit_log excessive grants
-- Created: December 2024
-- Issue: anon and authenticated have full CRUD + TRUNCATE on audit_log
-- Even though RLS blocks operations, this violates defense-in-depth

-- Revoke ALL from anon (should have NO access)
REVOKE ALL ON public.audit_log FROM anon;

-- Revoke ALL from authenticated, then grant only SELECT (for admin RLS policy)
REVOKE ALL ON public.audit_log FROM authenticated;
GRANT SELECT ON public.audit_log TO authenticated;

-- Note: service_role retains full access for trigger-based inserts
-- The audit_trigger_func() runs as SECURITY DEFINER and can insert
