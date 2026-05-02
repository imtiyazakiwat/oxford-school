-- Migration: Fix infinite recursion in roles table RLS policy
-- Created: December 2024
-- Issue: The "Only admins can view roles" policy references the roles table itself,
--        causing infinite recursion when checking permissions
-- Fix: Use the is_admin() SECURITY DEFINER function which bypasses RLS

-- Drop the problematic policy
DROP POLICY IF EXISTS "Only admins can view roles" ON roles;

-- Create a new policy using is_admin() function (SECURITY DEFINER bypasses RLS)
CREATE POLICY "Only admins can view roles" ON roles
  FOR SELECT USING (
    is_admin((SELECT auth.uid()))
  );
