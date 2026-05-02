-- Migration: Fix applications table RLS security
-- Created: December 2024
-- Issue: Applications table was completely open - anyone could read/update all applications
-- This exposed sensitive PII: Aadhar numbers, medical conditions, addresses, phone numbers

-- Drop insecure policies
DROP POLICY IF EXISTS "Anyone can view applications" ON applications;
DROP POLICY IF EXISTS "Anyone can update applications" ON applications;

-- Keep the insert policy - anyone should be able to submit an application
-- "Anyone can submit application" remains unchanged

-- Policy: Users can view their own application (matched by email) OR admins can view all
CREATE POLICY "Users can view own application or admins view all" ON applications
  FOR SELECT USING (
    -- Match by email (for applicants checking their status)
    email = current_setting('request.jwt.claims', true)::json->>'email'
    -- Or match by created_user_id (if they later create an account)
    OR created_user_id = auth.uid()
    -- Or user is an admin
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Only admins can update applications (approve/reject)
CREATE POLICY "Admins can update applications" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Note: DELETE policy already exists and correctly requires admin
-- "Only admins can delete applications" - uses JWT role check
