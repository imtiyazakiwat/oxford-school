-- Migration: Fix students table RLS security
-- Created: December 2024
-- Issue: Students table was completely open - anyone could read/insert/update all student records
-- This exposed sensitive PII: Aadhar numbers, fee information, medical conditions

-- Drop insecure policies
DROP POLICY IF EXISTS "Students can view own profile" ON students;
DROP POLICY IF EXISTS "Anyone can insert students" ON students;
DROP POLICY IF EXISTS "Anyone can update students" ON students;

-- Policy: Students can only view their own profile, admins/faculty can view all
CREATE POLICY "Students view own or staff view all" ON students
  FOR SELECT USING (
    -- Student can view their own record (matched by user_id)
    user_id = auth.uid()
    -- Or user is admin
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
    -- Or user is faculty (teachers need to see student info)
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'faculty'
    )
  );

-- Policy: Only admins can insert students (created after application approval)
CREATE POLICY "Admins can insert students" ON students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Students can update limited fields on own profile, admins can update all
CREATE POLICY "Students update own or admins update all" ON students
  FOR UPDATE USING (
    -- Student can update their own record
    user_id = auth.uid()
    -- Or user is admin
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    -- Student can only update their own record
    user_id = auth.uid()
    -- Or user is admin
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Policy: Only admins can delete students
CREATE POLICY "Admins can delete students" ON students
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
