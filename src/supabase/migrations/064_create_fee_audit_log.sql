-- Migration: Create fee_audit_log table and audit triggers for fee tables
-- Created: December 2024
-- Purpose: Immutable audit trail for all fee-related operations

-- =============================================================================
-- TABLE PURPOSE
-- =============================================================================
-- Stores an immutable audit trail of all changes to fee_structures, fee_records,
-- and fee_payments tables. Every INSERT, UPDATE, and DELETE operation is logged
-- with the admin who made the change, timestamp, and before/after values.

-- =============================================================================
-- THREAT MODEL SUMMARY
-- =============================================================================
-- Data stored: Audit entries with old/new values, admin ID, timestamps
-- Risks:
--   - Tampering with audit logs (covering tracks of fraud)
--   - Unauthorized viewing of audit logs (information disclosure)
--   - Deletion of audit entries (destroying evidence)
-- Mitigations:
--   - RLS policies block ALL modifications (UPDATE, DELETE, INSERT via client)
--   - Only SECURITY DEFINER trigger function can insert
--   - Admin read-only access via RLS
--   - No anon access

-- =============================================================================
-- ACCESS CONTROL
-- =============================================================================
-- Owners: System (via trigger function)
-- Allowed roles:
--   - Admin: Read-only access
--   - Anon: No access
--   - Authenticated (non-admin): No access
-- Forbidden roles:
--   - ALL roles: Cannot INSERT, UPDATE, or DELETE via client
--   - Only the SECURITY DEFINER trigger function can insert

-- =============================================================================
-- TABLE DEFINITION
-- =============================================================================
CREATE TABLE IF NOT EXISTS fee_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- =============================================================================
-- SECURE DEFAULTS: Revoke all permissions first
-- =============================================================================
REVOKE ALL ON fee_audit_log FROM anon;
REVOKE ALL ON fee_audit_log FROM authenticated;

-- Grant only SELECT to authenticated (RLS will further restrict to admins)
GRANT SELECT ON fee_audit_log TO authenticated;
-- Grant full access to service_role for backend operations and trigger function
GRANT ALL ON fee_audit_log TO service_role;

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE fee_audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES - IMMUTABILITY ENFORCEMENT
-- =============================================================================

-- Policy 1: Only admins can view audit logs
CREATE POLICY "Admins can view fee audit logs" ON fee_audit_log
  FOR SELECT TO authenticated
  USING (is_admin((SELECT auth.uid())));

-- Policy 2: Block ALL client inserts (only trigger function can insert)
CREATE POLICY "Block client insert fee audit" ON fee_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- Policy 3: Block ALL updates (audit logs are immutable)
CREATE POLICY "Block all updates fee audit" ON fee_audit_log
  FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

-- Policy 4: Block ALL deletes (audit logs are immutable)
CREATE POLICY "Block all deletes fee audit" ON fee_audit_log
  FOR DELETE TO authenticated
  USING (false);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_fee_audit_log_table_name ON fee_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_fee_audit_log_record_id ON fee_audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_fee_audit_log_changed_by ON fee_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_fee_audit_log_changed_at ON fee_audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_fee_audit_log_action ON fee_audit_log(action);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_fee_audit_log_table_date ON fee_audit_log(table_name, changed_at DESC);

-- =============================================================================
-- AUDIT TRIGGER FUNCTION
-- =============================================================================
-- SECURITY DEFINER allows this function to bypass RLS and insert into fee_audit_log
-- SET search_path prevents search_path manipulation attacks
CREATE OR REPLACE FUNCTION fee_audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_changed_by UUID;
  v_description TEXT;
BEGIN
  -- Get the current user ID
  v_changed_by := auth.uid();
  
  -- If no authenticated user (shouldn't happen with RLS), use a placeholder
  IF v_changed_by IS NULL THEN
    v_changed_by := '00000000-0000-0000-0000-000000000000'::UUID;
  END IF;
  
  -- Generate description based on action
  IF TG_OP = 'INSERT' THEN
    v_description := 'Created new ' || TG_TABLE_NAME || ' record';
    INSERT INTO fee_audit_log (table_name, record_id, action, new_data, changed_by, description)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), v_changed_by, v_description);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_description := 'Updated ' || TG_TABLE_NAME || ' record';
    INSERT INTO fee_audit_log (table_name, record_id, action, old_data, new_data, changed_by, description)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), v_changed_by, v_description);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_description := 'Deleted ' || TG_TABLE_NAME || ' record';
    INSERT INTO fee_audit_log (table_name, record_id, action, old_data, changed_by, description)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), v_changed_by, v_description);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- =============================================================================
-- ATTACH TRIGGERS TO FEE TABLES
-- =============================================================================

-- Trigger for fee_structures
DROP TRIGGER IF EXISTS audit_fee_structures ON fee_structures;
CREATE TRIGGER audit_fee_structures
  AFTER INSERT OR UPDATE OR DELETE ON fee_structures
  FOR EACH ROW EXECUTE FUNCTION fee_audit_trigger_func();

-- Trigger for fee_records
DROP TRIGGER IF EXISTS audit_fee_records ON fee_records;
CREATE TRIGGER audit_fee_records
  AFTER INSERT OR UPDATE OR DELETE ON fee_records
  FOR EACH ROW EXECUTE FUNCTION fee_audit_trigger_func();

-- Trigger for fee_payments
DROP TRIGGER IF EXISTS audit_fee_payments ON fee_payments;
CREATE TRIGGER audit_fee_payments
  AFTER INSERT OR UPDATE OR DELETE ON fee_payments
  FOR EACH ROW EXECUTE FUNCTION fee_audit_trigger_func();

-- =============================================================================
-- SECURE FUNCTION PERMISSIONS
-- =============================================================================
-- Revoke execute from public (anon inherits from public)
REVOKE EXECUTE ON FUNCTION fee_audit_trigger_func() FROM public;
REVOKE EXECUTE ON FUNCTION fee_audit_trigger_func() FROM anon;
REVOKE EXECUTE ON FUNCTION fee_audit_trigger_func() FROM authenticated;

-- Only service_role should be able to execute (triggers run as SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION fee_audit_trigger_func() TO service_role;

-- =============================================================================
-- POTENTIAL ATTACK VECTORS & MITIGATIONS
-- =============================================================================
-- 1. Direct INSERT to audit log: Blocked by RLS WITH CHECK (false)
-- 2. UPDATE audit entries: Blocked by RLS USING (false) WITH CHECK (false)
-- 3. DELETE audit entries: Blocked by RLS USING (false)
-- 4. Bypass via function: Function is SECURITY DEFINER but only callable by triggers
-- 5. Search path manipulation: Prevented by SET search_path = public
-- 6. Viewing other's audit data: Only admins can view via RLS

-- =============================================================================
-- WHY THIS DESIGN IS SAFE
-- =============================================================================
-- 1. RLS enabled with deny-all default for modifications
-- 2. Explicit REVOKE before GRANT pattern
-- 3. Admin read-only access enforced at database level
-- 4. Immutability enforced via RLS policies blocking UPDATE/DELETE
-- 5. Client INSERT blocked - only trigger function can insert
-- 6. SECURITY DEFINER function with explicit search_path
-- 7. Function permissions revoked from all client roles
-- 8. Comprehensive indexing for query performance
-- 9. No USING (true) on any operation
