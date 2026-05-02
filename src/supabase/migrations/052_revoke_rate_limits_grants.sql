-- Migration: Revoke excessive grants on rate_limits table
-- Created: 2024-12-21
-- Issue: rate_limits has full CRUD grants to anon/authenticated despite RLS blocking access
-- Risk: If RLS policy is accidentally dropped, full access would be exposed

-- Revoke all permissions from anon and authenticated
REVOKE ALL ON public.rate_limits FROM anon;
REVOKE ALL ON public.rate_limits FROM authenticated;

-- Only service_role should access this table (for rate limiting in API routes)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limits TO service_role;
