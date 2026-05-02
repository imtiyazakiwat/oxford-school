-- Migration: Extend audit retention for financial records
-- Created: December 2024
-- Purpose: Financial records require 7-year retention for regulatory compliance

-- =============================================================================
-- UPDATE FEE AUDIT LOG CLEANUP
-- =============================================================================
-- Override the default 90-day cleanup for fee_audit_log
-- Financial records must be retained for 7 years (2555 days)

CREATE OR REPLACE FUNCTION cleanup_old_fee_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Keep fee audit logs for 7 years (regulatory compliance)
  DELETE FROM fee_audit_log
  WHERE changed_at < NOW() - INTERVAL '7 years';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$;

-- =============================================================================
-- UPDATE GENERAL AUDIT LOG CLEANUP
-- =============================================================================
-- Keep financial-related entries longer
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  v_deleted INTEGER;
  v_financial_deleted INTEGER;
BEGIN
  -- Delete non-financial audit logs older than 90 days
  DELETE FROM audit_log
  WHERE changed_at < NOW() - INTERVAL '90 days'
    AND table_name NOT IN ('fee_structures', 'fee_records', 'fee_payments', 'students');
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  -- Delete financial/student audit logs older than 7 years
  DELETE FROM audit_log
  WHERE changed_at < NOW() - INTERVAL '7 years'
    AND table_name IN ('fee_structures', 'fee_records', 'fee_payments', 'students');
  
  GET DIAGNOSTICS v_financial_deleted = ROW_COUNT;
  
  RETURN v_deleted + v_financial_deleted;
END;
$;

-- =============================================================================
-- UPDATE SECURITY EVENTS CLEANUP
-- =============================================================================
-- Keep security events for 1 year (for forensics)
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Keep security events for 1 year
  DELETE FROM security_events
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$;

-- =============================================================================
-- PERMISSIONS
-- =============================================================================
GRANT EXECUTE ON FUNCTION cleanup_old_fee_audit_logs TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_security_events TO service_role;

REVOKE EXECUTE ON FUNCTION cleanup_old_fee_audit_logs FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION cleanup_old_audit_logs FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION cleanup_old_security_events FROM public, anon, authenticated;

-- =============================================================================
-- COMMENT
-- =============================================================================
COMMENT ON FUNCTION cleanup_old_fee_audit_logs() IS 
  'Cleanup fee audit logs older than 7 years (regulatory compliance)';
COMMENT ON FUNCTION cleanup_old_audit_logs() IS 
  'Cleanup audit logs - 90 days for general, 7 years for financial/student records';
COMMENT ON FUNCTION cleanup_old_security_events() IS 
  'Cleanup security events older than 1 year';
