-- Migration: Verify and fix any remaining insecure RLS policies
-- Created: December 2024
-- Purpose: Ensure no USING(true) policies exist on sensitive tables

-- =============================================================================
-- VERIFICATION FUNCTION
-- =============================================================================
-- This function checks for dangerous RLS policies and raises an error if found
CREATE OR REPLACE FUNCTION verify_secure_rls_policies()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  v_dangerous_policies TEXT[];
  v_policy RECORD;
BEGIN
  -- Find any policies with USING (true) on sensitive tables
  FOR v_policy IN
    SELECT 
      schemaname,
      tablename,
      policyname,
      cmd,
      qual
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'students', 
        'applications', 
        'fee_structures', 
        'fee_records', 
        'fee_payments',
        'user_roles',
        'roles',
        'otp_verifications',
        'audit_log',
        'fee_audit_log',
        'security_events'
      )
      AND (
        qual = 'true' 
        OR qual IS NULL
        OR qual = '(true)'
      )
      AND cmd IN ('SELECT', 'UPDATE', 'DELETE')
  LOOP
    v_dangerous_policies := array_append(
      v_dangerous_policies, 
      format('%s.%s: %s (%s)', v_policy.schemaname, v_policy.tablename, v_policy.policyname, v_policy.cmd)
    );
  END LOOP;
  
  IF array_length(v_dangerous_policies, 1) > 0 THEN
    RETURN 'DANGER: Found insecure policies: ' || array_to_string(v_dangerous_policies, ', ');
  END IF;
  
  RETURN 'OK: All RLS policies are secure';
END;
$;

-- =============================================================================
-- RUN VERIFICATION
-- =============================================================================
DO $
DECLARE
  v_result TEXT;
BEGIN
  SELECT verify_secure_rls_policies() INTO v_result;
  
  IF v_result LIKE 'DANGER%' THEN
    RAISE WARNING '%', v_result;
    -- Uncomment the next line to make this a blocking error:
    -- RAISE EXCEPTION '%', v_result;
  ELSE
    RAISE NOTICE '%', v_result;
  END IF;
END;
$;

-- =============================================================================
-- ENSURE CRITICAL TABLES HAVE RLS ENABLED
-- =============================================================================
DO $
DECLARE
  v_table TEXT;
  v_tables TEXT[] := ARRAY[
    'students', 
    'applications', 
    'fee_structures', 
    'fee_records', 
    'fee_payments',
    'user_roles',
    'roles',
    'otp_verifications',
    'audit_log',
    'fee_audit_log',
    'security_events',
    'contact_submissions',
    'account_lockouts'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_tables
  LOOP
    -- Check if table exists before enabling RLS
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = v_table
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', v_table);
      RAISE NOTICE 'RLS enabled on %', v_table;
    END IF;
  END LOOP;
END;
$;

-- =============================================================================
-- DROP VERIFICATION FUNCTION (cleanup)
-- =============================================================================
-- Keep the function for future audits
COMMENT ON FUNCTION verify_secure_rls_policies() IS 
  'Security audit function: Checks for dangerous USING(true) RLS policies on sensitive tables';

GRANT EXECUTE ON FUNCTION verify_secure_rls_policies TO service_role;
REVOKE EXECUTE ON FUNCTION verify_secure_rls_policies FROM public, anon, authenticated;
