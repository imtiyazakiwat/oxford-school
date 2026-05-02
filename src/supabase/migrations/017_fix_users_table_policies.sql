-- Migration: Fix users table RLS policies
-- Created: December 2024
-- Issue: Missing INSERT and DELETE policies on users table

-- Policy: Users can only be inserted via auth trigger (id must match auth.uid())
-- This prevents anyone from creating arbitrary user records
CREATE POLICY "Users created via auth only" ON users
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

-- Policy: Only admins can delete user records
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    is_admin(auth.uid())
  );

-- Note: Existing policies remain:
-- "Users can view all profiles" - SELECT USING (true) - OK for basic profile info
-- "Users can update own profile" - UPDATE USING (auth.uid() = id) - OK
