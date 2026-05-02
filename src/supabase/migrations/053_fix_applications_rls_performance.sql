-- Migration: Fix applications RLS policy performance
-- Created: 2024-12-21
-- Issue: Policy re-evaluates current_setting() for each row instead of once per query
-- Fix: Wrap auth functions in (SELECT ...) to evaluate once

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view own application or admins view all" ON applications;

-- Recreate with optimized subquery pattern
CREATE POLICY "Users can view own application or admins view all" ON applications
FOR SELECT USING (
  email = ((SELECT current_setting('request.jwt.claims', true))::json->>'email')
  OR created_user_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
  )
);
