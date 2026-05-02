-- Migration: Add account lockout functionality
-- Created: December 2024
-- Purpose: Lock accounts after repeated failed login attempts

-- =============================================================================
-- DESIGN DECISION: Why no FK to auth.users?
-- =============================================================================
-- This table tracks by EMAIL, not user_id, because:
-- 1. Must track failed login attempts for non-existent accounts (typos, enumeration)
-- 2. Must work before user is authenticated
-- 3. Email is the login identifier, not user_id
-- =============================================================================

-- =============================================================================
-- TABLE: account_lockouts
-- =============================================================================
-- Tracks failed login attempts and account lockout status
CREATE TABLE IF NOT EXISTS account_lockouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,  -- Intentionally NOT a FK - see design decision above
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_email_lockout UNIQUE (email)
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON account_lockouts(email);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_locked_until ON account_lockouts(locked_until);

-- =============================================================================
-- SECURE DEFAULTS
-- =============================================================================
REVOKE ALL ON account_lockouts FROM anon;
REVOKE ALL ON account_lockouts FROM authenticated;

-- Only service_role can access (API routes handle lockout logic)
GRANT ALL ON account_lockouts TO service_role;

-- =============================================================================
-- ENABLE RLS
-- =============================================================================
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;

-- Block all client access (only service_role via API)
CREATE POLICY "Block all client access to lockouts" ON account_lockouts
  FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);

-- =============================================================================
-- FUNCTION: check_account_lockout
-- =============================================================================
-- Returns lockout status for an email
CREATE OR REPLACE FUNCTION check_account_lockout(p_email TEXT)
RETURNS TABLE (
  is_locked BOOLEAN,
  locked_until TIMESTAMPTZ,
  failed_attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN al.locked_until IS NOT NULL AND al.locked_until > NOW() THEN true
      ELSE false
    END as is_locked,
    al.locked_until,
    COALESCE(al.failed_attempts, 0) as failed_attempts
  FROM account_lockouts al
  WHERE al.email = LOWER(p_email);
  
  -- If no record exists, return unlocked status
  IF NOT FOUND THEN
    RETURN QUERY SELECT false::BOOLEAN, NULL::TIMESTAMPTZ, 0::INTEGER;
  END IF;
END;
$;

-- =============================================================================
-- FUNCTION: record_failed_login
-- =============================================================================
-- Records a failed login attempt and locks account if threshold exceeded
CREATE OR REPLACE FUNCTION record_failed_login(
  p_email TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_lockout_minutes INTEGER DEFAULT 15
)
RETURNS TABLE (
  is_now_locked BOOLEAN,
  locked_until TIMESTAMPTZ,
  attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  v_record account_lockouts%ROWTYPE;
  v_new_attempts INTEGER;
  v_lock_until TIMESTAMPTZ;
BEGIN
  -- Get or create lockout record
  SELECT * INTO v_record
  FROM account_lockouts
  WHERE email = LOWER(p_email)
  FOR UPDATE;
  
  IF NOT FOUND THEN
    -- Create new record
    INSERT INTO account_lockouts (email, failed_attempts, last_failed_at)
    VALUES (LOWER(p_email), 1, NOW())
    RETURNING * INTO v_record;
    
    RETURN QUERY SELECT false, NULL::TIMESTAMPTZ, 1;
    RETURN;
  END IF;
  
  -- Reset counter if last failure was more than lockout period ago
  IF v_record.last_failed_at < NOW() - (p_lockout_minutes || ' minutes')::INTERVAL THEN
    v_new_attempts := 1;
  ELSE
    v_new_attempts := v_record.failed_attempts + 1;
  END IF;
  
  -- Check if should lock
  IF v_new_attempts >= p_max_attempts THEN
    v_lock_until := NOW() + (p_lockout_minutes || ' minutes')::INTERVAL;
  ELSE
    v_lock_until := NULL;
  END IF;
  
  -- Update record
  UPDATE account_lockouts
  SET 
    failed_attempts = v_new_attempts,
    locked_until = v_lock_until,
    last_failed_at = NOW(),
    updated_at = NOW()
  WHERE email = LOWER(p_email);
  
  RETURN QUERY SELECT 
    v_lock_until IS NOT NULL,
    v_lock_until,
    v_new_attempts;
END;
$;

-- =============================================================================
-- FUNCTION: clear_account_lockout
-- =============================================================================
-- Clears lockout after successful login
CREATE OR REPLACE FUNCTION clear_account_lockout(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  UPDATE account_lockouts
  SET 
    failed_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
  WHERE email = LOWER(p_email);
END;
$;

-- =============================================================================
-- FUNCTION: cleanup_old_lockouts
-- =============================================================================
-- Cleanup old lockout records (run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_lockouts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Delete records older than 24 hours with no active lockout
  DELETE FROM account_lockouts
  WHERE updated_at < NOW() - INTERVAL '24 hours'
    AND (locked_until IS NULL OR locked_until < NOW());
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$;

-- =============================================================================
-- PERMISSIONS
-- =============================================================================
GRANT EXECUTE ON FUNCTION check_account_lockout TO service_role;
GRANT EXECUTE ON FUNCTION record_failed_login TO service_role;
GRANT EXECUTE ON FUNCTION clear_account_lockout TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_lockouts TO service_role;

REVOKE EXECUTE ON FUNCTION check_account_lockout FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION record_failed_login FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION clear_account_lockout FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION cleanup_old_lockouts FROM public, anon, authenticated;

-- =============================================================================
-- COMMENT
-- =============================================================================
COMMENT ON TABLE account_lockouts IS 
  'Tracks failed login attempts and account lockout status for brute force protection';
