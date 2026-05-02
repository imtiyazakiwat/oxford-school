-- Migration: Fix applications DELETE policy
-- Created: December 2024
-- Issue: DELETE policy used JWT 'role' claim which isn't set in auth flow
-- Should use user_roles table like other admin policies

-- Drop the broken policy
DROP POLICY IF EXISTS "Only admins can delete applications" ON applications;

-- Create correct policy using user_roles table
CREATE POLICY "Admins can delete applications" ON applications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
