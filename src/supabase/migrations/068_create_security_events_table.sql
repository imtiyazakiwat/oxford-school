-- Migration: Create security_events table for security event logging
-- Created: December 2024
-- Purpose: Persistent logging of security-relevant events for monitoring and forensics

-- =============================================================================
-- TABLE PURPOSE
-- =============================================================================
-- Stores security events such as failed login attempts, rate limit violations,
-- unauthorized access attempts, and suspicious activity. This provides:
-- 1. Forensic evidence for security incidents
-- 2. Data for security monitoring and alerting
-- 3. Compliance audit trail

-- =============================================================================
-- THREAT MODEL
-- =============================================================================
-- Data stored: Event type, IP addresses (masked), timestamps, context
-- Risks:
--   - Information disclosure if logs are accessed by unauthorized users
--   - Log tampering to cover tracks
--   - Storage exhaustion via log flooding
-- Mitigations:
--   - Admin-only read access via RLS
--   - Immutable logs (no UPDATE/DELETE)
--   - Automatic cleanup of old entries
--   - Rate limiting on log insertion

-- =============================================================================
-- TABLE DEFINITION
-- =============================================================================
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'auth_success',
    'auth_failure',
    'rate_limit_exceeded',
    'invalid_input',
    'unauthorized_access',
    'suspicious_activity',
    'password_reset_request',
    'password_reset_success',
    'account_locked',
    'session_timeout'
  )),
  ip_address TEXT,              -- Masked IP for privacy
  user_id UUID,                 -- User ID if known
  email TEXT,                   -- Masked email if relevant
  endpoint TEXT,                -- API endpoint or page
  user_agent TEXT,              -- Browser/client info
  details JSONB,                -- Additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);

-- Composite index for common queries
CREATE INDEX idx_security_events_type_created ON security_events(event_type, created_at DESC);

-- =============================================================================
-- SECURE DEFAULTS
-- =============================================================================
REVOKE ALL ON security_events FROM anon;
REVOKE ALL ON security_events FROM authenticated;

-- Grant SELECT to authenticated (RLS will restrict to admins)
GRANT SELECT ON security_events TO authenticated;
-- Grant INSERT to service_role (API routes log events)
GRANT INSERT ON security_events TO service_role;
-- Full access for service_role
GRANT ALL ON security_events TO service_role;

-- =============================================================================
-- ENABLE RLS
-- =============================================================================
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Only admins can view security events
CREATE POLICY "Admins can view security events" ON security_events
  FOR SELECT TO authenticated
  USING (is_admin((SELECT auth.uid())));

-- Block all client inserts (only service_role can insert)
CREATE POLICY "Block client insert security events" ON security_events
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- Block all updates (logs are immutable)
CREATE POLICY "Block all updates security events" ON security_events
  FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

-- Block all deletes (logs are immutable)
CREATE POLICY "Block all deletes security events" ON security_events
  FOR DELETE TO authenticated
  USING (false);

-- =============================================================================
-- LOG SECURITY EVENT FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_endpoint TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_masked_ip TEXT;
  v_masked_email TEXT;
  v_event_id UUID;
BEGIN
  -- Mask IP address for privacy (show first 2 octets for IPv4)
  IF p_ip_address IS NOT NULL THEN
    IF p_ip_address LIKE '%.%.%.%' THEN
      -- IPv4: mask last 2 octets
      v_masked_ip := regexp_replace(p_ip_address, '(\d+\.\d+)\.\d+\.\d+', '\1.xxx.xxx');
    ELSE
      -- IPv6: mask last segments
      v_masked_ip := regexp_replace(p_ip_address, '(([0-9a-fA-F]{0,4}:){4}).*', '\1xxxx:xxxx:xxxx:xxxx');
    END IF;
  END IF;
  
  -- Mask email for privacy (show first 3 chars + domain)
  IF p_email IS NOT NULL THEN
    v_masked_email := regexp_replace(p_email, '^(.{3}).*(@.*)$', '\1***\2');
  END IF;
  
  -- Insert event
  INSERT INTO security_events (
    event_type,
    ip_address,
    user_id,
    email,
    endpoint,
    user_agent,
    details
  ) VALUES (
    p_event_type,
    v_masked_ip,
    p_user_id,
    v_masked_email,
    p_endpoint,
    LEFT(p_user_agent, 500), -- Truncate user agent
    p_details
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- =============================================================================
-- CLEANUP FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Keep events for 90 days
  DELETE FROM security_events
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- =============================================================================
-- PERMISSIONS
-- =============================================================================
-- Allow service_role to call log function
GRANT EXECUTE ON FUNCTION log_security_event TO service_role;

-- Revoke from others
REVOKE EXECUTE ON FUNCTION log_security_event FROM public;
REVOKE EXECUTE ON FUNCTION log_security_event FROM anon;
REVOKE EXECUTE ON FUNCTION log_security_event FROM authenticated;

REVOKE EXECUTE ON FUNCTION cleanup_old_security_events FROM public;
REVOKE EXECUTE ON FUNCTION cleanup_old_security_events FROM anon;
REVOKE EXECUTE ON FUNCTION cleanup_old_security_events FROM authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_security_events TO service_role;

-- =============================================================================
-- SCHEDULE CLEANUP (if pg_cron available)
-- =============================================================================
-- SELECT cron.schedule('cleanup-security-events', '0 3 * * *', 'SELECT cleanup_old_security_events()');
