-- Migration: Restrict users table SELECT policy
-- Created: December 2024
-- Issue: Anyone could see all user emails - should be authenticated only

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON users;

-- Authenticated users can view profiles (needed for displaying names)
CREATE POLICY "Authenticated users can view profiles" ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Anon users can only see their own profile (if somehow authenticated)
-- This effectively blocks anon from seeing any user data
