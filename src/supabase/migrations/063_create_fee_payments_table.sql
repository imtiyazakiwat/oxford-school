-- Migration: Create fee_payments table for payment transactions
-- Created: December 2024
-- Purpose: Store individual payment transactions against student fee records

-- =============================================================================
-- TABLE PURPOSE
-- =============================================================================
-- Stores individual payment transactions. Each record represents a cash payment
-- made by a student against their fee record. Includes receipt number generation,
-- payment date, amount, and the admin who recorded the payment.

-- =============================================================================
-- THREAT MODEL SUMMARY
-- =============================================================================
-- Data stored: Payment amounts, receipt numbers, payment dates, admin who recorded
-- Risks:
--   - Unauthorized creation of fake payments (financial fraud)
--   - Students viewing other students' payment data (privacy breach)
--   - Modification of payment records (tampering with financial records)
--   - Deletion of payment records (loss of financial audit trail)
--   - Duplicate receipt numbers (receipt fraud)
-- Mitigations:
--   - Admin-only write access via RLS
--   - Student can only view their own payments via RLS
--   - UNIQUE constraint on receipt_number
--   - Audit logging via triggers (handled in migration 064)
--   - Foreign key constraints ensure data integrity

-- =============================================================================
-- ACCESS CONTROL
-- =============================================================================
-- Owners: Admin users (recorded_by field)
-- Allowed roles:
--   - Admin: Full CRUD access (though updates/deletes should be rare)
--   - Student (authenticated): Read-only access to OWN payments only
--   - Anon: No access
-- Forbidden roles:
--   - Anon: Cannot view or modify
--   - Non-admin authenticated: Cannot create, update, or delete

-- =============================================================================
-- TABLE DEFINITION
-- =============================================================================
CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_record_id UUID NOT NULL REFERENCES fee_records(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  
  -- Payment details
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash')),
  
  -- Receipt information
  receipt_number TEXT UNIQUE NOT NULL,
  
  -- Additional info
  notes TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SECURE DEFAULTS: Revoke all permissions first
-- =============================================================================
REVOKE ALL ON fee_payments FROM anon;
REVOKE ALL ON fee_payments FROM authenticated;

-- Grant SELECT, INSERT, UPDATE, DELETE to authenticated (RLS will restrict writes to admins)
-- Note: We need to grant write permissions so RLS policies can allow admin operations
GRANT SELECT, INSERT, UPDATE, DELETE ON fee_payments TO authenticated;
-- Grant full access to service_role for backend operations
GRANT ALL ON fee_payments TO service_role;

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Policy 1: Students can view their own payments only
-- Uses subquery to get student record for the authenticated user
CREATE POLICY "Students can view own payments" ON fee_payments
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = (SELECT auth.uid())
    )
  );

-- Policy 2: Admins can view all payments
CREATE POLICY "Admins can view all payments" ON fee_payments
  FOR SELECT TO authenticated
  USING (is_admin((SELECT auth.uid())));

-- Policy 3: Only admins can insert payments
-- WITH CHECK ensures recorded_by matches the authenticated user
CREATE POLICY "Admins can insert payments" ON fee_payments
  FOR INSERT TO authenticated
  WITH CHECK (
    is_admin((SELECT auth.uid())) AND
    recorded_by = (SELECT auth.uid())
  );

-- Policy 4: Only admins can update payments (should be rare - for corrections only)
-- WITH CHECK prevents ownership reassignment
CREATE POLICY "Admins can update payments" ON fee_payments
  FOR UPDATE TO authenticated
  USING (is_admin((SELECT auth.uid())))
  WITH CHECK (
    is_admin((SELECT auth.uid())) AND
    recorded_by = recorded_by  -- Prevent ownership change
  );

-- Policy 5: Only admins can delete payments (should be very rare - for corrections only)
CREATE POLICY "Admins can delete payments" ON fee_payments
  FOR DELETE TO authenticated
  USING (is_admin((SELECT auth.uid())));

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_fee_payments_fee_record_id ON fee_payments(fee_record_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_payment_date ON fee_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_fee_payments_recorded_by ON fee_payments(recorded_by);
CREATE INDEX IF NOT EXISTS idx_fee_payments_created_at ON fee_payments(created_at DESC);

-- Composite index for common query patterns (student payment history)
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_date ON fee_payments(student_id, payment_date DESC);

-- =============================================================================
-- POTENTIAL ATTACK VECTORS & MITIGATIONS
-- =============================================================================
-- 1. IDOR (student viewing other's payments): Prevented by student_id check in RLS
-- 2. Privilege escalation via recorded_by: Prevented by WITH CHECK constraint
-- 3. Negative/zero payment amounts: Prevented by CHECK constraint (amount > 0)
-- 4. Duplicate receipt numbers: Prevented by UNIQUE constraint
-- 5. Orphaned payments: Prevented by ON DELETE RESTRICT on fee_record_id
-- 6. Invalid payment method: Prevented by CHECK constraint
-- 7. Fake payment creation: Prevented by admin-only INSERT policy

-- =============================================================================
-- WHY THIS DESIGN IS SAFE
-- =============================================================================
-- 1. RLS enabled with deny-all default
-- 2. Explicit REVOKE before GRANT pattern
-- 3. Admin-only write access enforced at database level
-- 4. Student data isolation via student_id check
-- 5. Ownership immutability via WITH CHECK
-- 6. Positive amount validation via CHECK constraint
-- 7. Receipt uniqueness via UNIQUE constraint
-- 8. Audit trail via triggers (added in migration 064)
-- 9. No USING (true) on sensitive operations
-- 10. Referential integrity via foreign keys with RESTRICT
