-- Migration: Revoke excessive grants on rate_limits table
-- Created: 2025-12-21
-- Security: Remove unnecessary TRUNCATE, TRIGGER, REFERENCES grants

-- Revoke excessive grants from anon
REVOKE TRUNCATE ON public.rate_limits FROM anon;
REVOKE TRIGGER ON public.rate_limits FROM anon;
REVOKE REFERENCES ON public.rate_limits FROM anon;

-- Revoke excessive grants from authenticated
REVOKE TRUNCATE ON public.rate_limits FROM authenticated;
REVOKE TRIGGER ON public.rate_limits FROM authenticated;
REVOKE REFERENCES ON public.rate_limits FROM authenticated;

-- Note: RLS policy already blocks all client access with USING (false)
-- These revokes are defense-in-depth
