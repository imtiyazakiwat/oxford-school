-- Migration: Restrict users SELECT policy
-- Created: December 2024
-- Issue: "Authenticated users can view profiles" uses USING (true)
-- Risk: Any authenticated user can enumerate all user emails/names

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON users;

-- Create restrictive policy: users can only see their own profile, admins see all
CREATE POLICY "Users view own profile or admins view all" ON users
  FOR SELECT USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
