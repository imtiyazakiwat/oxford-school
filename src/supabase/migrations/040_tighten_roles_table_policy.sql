-- Migration: Tighten roles table SELECT policy
-- Created: December 2024
-- Issue: Any authenticated user could see all roles
-- Fix: Only admins can view the roles table

DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;

CREATE POLICY "Only admins can view roles" ON roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
