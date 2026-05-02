-- Migration: Revoke anon SELECT on users table
-- Created: December 2024
-- Issue: anon has SELECT grant on users table (defense-in-depth violation)
-- The RLS policy only allows authenticated users, but the GRANT exists

REVOKE SELECT ON public.users FROM anon;

-- Note: authenticated role retains SELECT for the RLS policy
-- "Authenticated users can view profiles" TO authenticated USING (true)
