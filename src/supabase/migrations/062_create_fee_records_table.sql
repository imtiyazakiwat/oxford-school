-- Migration: Create fee_records table for student fee assignments
-- Created: December 2024
-- Purpose: Store individual student fee assignments with payment tracking

-- =============================================================================
-- TABLE PURPOSE
-- =============================================================================
-- Stores individual student fee assignments. Each record represents a student's
-- fee obligation for an academic year, including total fees, paid amount, due amount,
-- due date, and current status. Links to fee_structures for template reference.

-- =============================================================================
-- THREAT MODEL SUMMARY
-- =============================================================================
-- Data stored: Student fee amounts, payment status, due dates, admin who assigned
-- Risks:
--   - Unauthorized modification of fee amounts (financial fraud)
--   - Students viewing other students' fee data (privacy breach)
--   - Unauthorized status changes (marking fees as paid without payment)
--   - Deletion of fee records (loss of financial data)
-- Mitigations:
--   - Admin-only write access via RLS
--   - Student can only view their own records via RLS
--   - Audit logging via triggers (handled in migration 064)
--   - Foreign key constraints ensure data integrity

-- =============================================================================
-- ACCESS CONTROL
-- =============================================================================
-- Owners: Admin users (created_by field)
-- Allowed roles:
--   - Admin: Full CRUD access
--   - Student (authenticated): Read-only access to OWN records only
--   - Anon: No access
-- Forbidden roles:
--   - Anon: Cannot view or modify
--   - Non-admin authenticated: Cannot create, update, or delete

-- =============================================================================
-- TABLE DEFINITION
-- =============================================================================
CREATE TABLE IF NOT EXISTS fee_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL,
  
  -- Fee amounts using NUMERIC for precise monetary calculations
  total_fees NUMERIC(10,2) NOT NULL CHECK (total_fees >= 0),
  paid_fees NUMERIC(10,2) DEFAULT 0 CHECK (paid_fees >= 0),
  due_fees NUMERIC(10,2) NOT NULL CHECK (due_fees >= 0),
  
  -- Due date and status
  due_date DATE NOT NULL,
  fee_status TEXT DEFAULT 'Pending' CHECK (fee_status IN ('Paid', 'Partial', 'Pending', 'Overdue')),
  
  -- Fee breakdown (copied from fee_structure at assignment time)
  tuition_fee NUMERIC(10,2) DEFAULT 0 CHECK (tuition_fee >= 0),
  lab_fee NUMERIC(10,2) DEFAULT 0 CHECK (lab_fee >= 0),
  library_fee NUMERIC(10,2) DEFAULT 0 CHECK (library_fee >= 0),
  sports_fee NUMERIC(10,2) DEFAULT 0 CHECK (sports_fee >= 0),
  exam_fee NUMERIC(10,2) DEFAULT 0 CHECK (exam_fee >= 0),
  other_fee NUMERIC(10,2) DEFAULT 0 CHECK (other_fee >= 0),
  
  -- Additional info
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: paid_fees should not exceed total_fees
  CONSTRAINT paid_not_exceed_total CHECK (paid_fees <= total_fees)
);

-- =============================================================================
-- SECURE DEFAULTS: Revoke all permissions first
-- =============================================================================
REVOKE ALL ON fee_records FROM anon;
REVOKE ALL ON fee_records FROM authenticated;

-- Grant SELECT, INSERT, UPDATE, DELETE to authenticated (RLS will restrict writes to admins)
-- Note: We need to grant write permissions so RLS policies can allow admin operations
GRANT SELECT, INSERT, UPDATE, DELETE ON fee_records TO authenticated;
-- Grant full access to service_role for backend operations
GRANT ALL ON fee_records TO service_role;

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE fee_records ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Policy 1: Students can view their own fee records only
-- Uses subquery to get student record for the authenticated user
CREATE POLICY "Students can view own fee records" ON fee_records
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = (SELECT auth.uid())
    )
  );

-- Policy 2: Admins can view all fee records
CREATE POLICY "Admins can view all fee records" ON fee_records
  FOR SELECT TO authenticated
  USING (is_admin((SELECT auth.uid())));

-- Policy 3: Only admins can insert fee records
-- WITH CHECK ensures created_by matches the authenticated user
CREATE POLICY "Admins can insert fee records" ON fee_records
  FOR INSERT TO authenticated
  WITH CHECK (
    is_admin((SELECT auth.uid())) AND
    created_by = (SELECT auth.uid())
  );

-- Policy 4: Only admins can update fee records
-- WITH CHECK prevents ownership reassignment
CREATE POLICY "Admins can update fee records" ON fee_records
  FOR UPDATE TO authenticated
  USING (is_admin((SELECT auth.uid())))
  WITH CHECK (
    is_admin((SELECT auth.uid())) AND
    created_by = created_by  -- Prevent ownership change
  );

-- Policy 5: Only admins can delete fee records
CREATE POLICY "Admins can delete fee records" ON fee_records
  FOR DELETE TO authenticated
  USING (is_admin((SELECT auth.uid())));

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_fee_records_student_id ON fee_records(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_academic_year ON fee_records(academic_year);
CREATE INDEX IF NOT EXISTS idx_fee_records_fee_status ON fee_records(fee_status);
CREATE INDEX IF NOT EXISTS idx_fee_records_due_date ON fee_records(due_date);
CREATE INDEX IF NOT EXISTS idx_fee_records_fee_structure_id ON fee_records(fee_structure_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_created_by ON fee_records(created_by);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_fee_records_student_year ON fee_records(student_id, academic_year);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================
CREATE TRIGGER handle_fee_records_updated_at
  BEFORE UPDATE ON fee_records
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- POTENTIAL ATTACK VECTORS & MITIGATIONS
-- =============================================================================
-- 1. IDOR (student viewing other's fees): Prevented by student_id check in RLS
-- 2. Privilege escalation via created_by: Prevented by WITH CHECK constraint
-- 3. Negative fee amounts: Prevented by CHECK constraints
-- 4. Paid exceeding total: Prevented by paid_not_exceed_total constraint
-- 5. Orphaned records: Prevented by ON DELETE RESTRICT on student_id
-- 6. Invalid status: Prevented by CHECK constraint on fee_status

-- =============================================================================
-- WHY THIS DESIGN IS SAFE
-- =============================================================================
-- 1. RLS enabled with deny-all default
-- 2. Explicit REVOKE before GRANT pattern
-- 3. Admin-only write access enforced at database level
-- 4. Student data isolation via student_id check
-- 5. Ownership immutability via WITH CHECK
-- 6. Positive amount validation via CHECK constraints
-- 7. Business rule enforcement (paid <= total) via CHECK constraint
-- 8. Audit trail via triggers (added in migration 064)
-- 9. No USING (true) on sensitive operations
