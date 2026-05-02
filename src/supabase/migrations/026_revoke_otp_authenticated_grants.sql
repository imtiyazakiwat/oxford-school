-- Migration: Revoke all grants from authenticated on otp_verifications
-- Created: December 2024
-- Issue: authenticated role still has GRANTs on otp_verifications (blocked by RLS but defense-in-depth)

REVOKE ALL ON public.otp_verifications FROM authenticated;

-- Only service_role should access this table (via API routes)
