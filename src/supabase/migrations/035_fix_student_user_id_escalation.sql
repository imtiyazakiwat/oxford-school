-- Migration: Fix student user_id privilege escalation vulnerability
-- Created: December 2024
-- Issue: Students can change their user_id to hijack another student's record
-- Solution: Use trigger to prevent non-admins from modifying sensitive columns

-- Drop the existing policy
DROP POLICY IF EXISTS "Students update own or admins update all" ON students;

-- Create a more restrictive UPDATE policy
-- The USING clause determines which rows can be updated
-- The WITH CHECK clause validates the new data
CREATE POLICY "Students update own or admins update all" ON students
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Create trigger function to prevent students from modifying sensitive columns
CREATE OR REPLACE FUNCTION prevent_student_sensitive_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is admin, allow all changes
  IF EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ) THEN
    RETURN NEW;
  END IF;

  -- For non-admins (students), prevent modification of sensitive columns
  -- Revert these columns to their original values
  NEW.user_id := OLD.user_id;
  NEW.student_id := OLD.student_id;
  NEW.application_id := OLD.application_id;
  NEW.status := OLD.status;
  NEW.fee_status := OLD.fee_status;
  NEW.total_fees := OLD.total_fees;
  NEW.paid_fees := OLD.paid_fees;
  NEW.due_fees := OLD.due_fees;
  NEW.admission_date := OLD.admission_date;
  NEW.class := OLD.class;
  NEW.section := OLD.section;
  NEW.roll_number := OLD.roll_number;
  NEW.academic_year := OLD.academic_year;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS prevent_student_sensitive_update_trigger ON students;

-- Create the trigger
CREATE TRIGGER prevent_student_sensitive_update_trigger
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION prevent_student_sensitive_update();

-- Add comment explaining the security measure
COMMENT ON FUNCTION prevent_student_sensitive_update() IS 
  'Security trigger: Prevents non-admin users from modifying sensitive student columns like user_id, fees, status, etc.';
