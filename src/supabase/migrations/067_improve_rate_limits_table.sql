-- Migration: Improve rate_limits table for persistent rate limiting
-- Created: December 2024
-- Purpose: Provide persistent rate limiting that survives server restarts

-- =============================================================================
-- TABLE PURPOSE
-- =============================================================================
-- Stores rate limit entries for API endpoints. Each entry tracks request counts
-- per identifier (IP, email, etc.) with automatic expiration via pg_cron cleanup.
-- This replaces in-memory rate limiting for production reliability.

-- =============================================================================
-- DROP EXISTING TABLE IF EXISTS (to recreate with better structure)
-- =============================================================================
DROP TABLE IF EXISTS rate_limits CASCADE;

-- =============================================================================
-- TABLE DEFINITION
-- =============================================================================
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,           -- IP address, email, or combined key
  endpoint TEXT NOT NULL,             -- API endpoint or action type
  request_count INTEGER DEFAULT 1,    -- Number of requests in window
  window_start TIMESTAMPTZ DEFAULT NOW(), -- Start of rate limit window
  window_end TIMESTAMPTZ NOT NULL,    -- End of rate limit window
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Composite unique constraint for upsert operations
  CONSTRAINT rate_limits_identifier_endpoint_key UNIQUE (identifier, endpoint)
);

-- =============================================================================
-- INDEXES
-- =============================================================================
-- Index for cleanup queries (expired entries)
CREATE INDEX idx_rate_limits_window_end ON rate_limits(window_end);

-- Index for lookups
CREATE INDEX idx_rate_limits_identifier_endpoint ON rate_limits(identifier, endpoint);

-- =============================================================================
-- SECURE DEFAULTS
-- =============================================================================
REVOKE ALL ON rate_limits FROM anon;
REVOKE ALL ON rate_limits FROM authenticated;

-- Only service_role can access (API routes use service role for rate limiting)
GRANT ALL ON rate_limits TO service_role;

-- =============================================================================
-- RLS (Disabled - only service_role access)
-- =============================================================================
-- RLS is not enabled because only service_role should access this table
-- and service_role bypasses RLS anyway

-- =============================================================================
-- RATE LIMIT CHECK FUNCTION
-- =============================================================================
-- Returns: { allowed: boolean, remaining: integer, reset_at: timestamptz }
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_now TIMESTAMPTZ;
  v_window_end TIMESTAMPTZ;
  v_remaining INTEGER;
BEGIN
  v_now := NOW();
  v_window_end := v_now + (p_window_seconds || ' seconds')::INTERVAL;
  
  -- Try to get existing record
  SELECT * INTO v_record
  FROM rate_limits
  WHERE identifier = p_identifier AND endpoint = p_endpoint
  FOR UPDATE;
  
  IF NOT FOUND THEN
    -- First request - create new entry
    INSERT INTO rate_limits (identifier, endpoint, request_count, window_start, window_end)
    VALUES (p_identifier, p_endpoint, 1, v_now, v_window_end);
    
    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_requests - 1,
      'reset_at', v_window_end
    );
  END IF;
  
  -- Check if window has expired
  IF v_record.window_end < v_now THEN
    -- Window expired - reset counter
    UPDATE rate_limits
    SET request_count = 1,
        window_start = v_now,
        window_end = v_window_end,
        updated_at = v_now
    WHERE id = v_record.id;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'remaining', p_max_requests - 1,
      'reset_at', v_window_end
    );
  END IF;
  
  -- Window still active - check count
  IF v_record.request_count >= p_max_requests THEN
    -- Rate limit exceeded
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reset_at', v_record.window_end
    );
  END IF;
  
  -- Increment counter
  UPDATE rate_limits
  SET request_count = request_count + 1,
      updated_at = v_now
  WHERE id = v_record.id;
  
  v_remaining := p_max_requests - v_record.request_count - 1;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', v_remaining,
    'reset_at', v_record.window_end
  );
END;
$$;

-- =============================================================================
-- CLEANUP FUNCTION (for pg_cron)
-- =============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM rate_limits
  WHERE window_end < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- =============================================================================
-- PERMISSIONS
-- =============================================================================
REVOKE EXECUTE ON FUNCTION check_rate_limit FROM public;
REVOKE EXECUTE ON FUNCTION check_rate_limit FROM anon;
REVOKE EXECUTE ON FUNCTION check_rate_limit FROM authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO service_role;

REVOKE EXECUTE ON FUNCTION cleanup_expired_rate_limits FROM public;
REVOKE EXECUTE ON FUNCTION cleanup_expired_rate_limits FROM anon;
REVOKE EXECUTE ON FUNCTION cleanup_expired_rate_limits FROM authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_rate_limits TO service_role;

-- =============================================================================
-- SCHEDULE CLEANUP (if pg_cron is available)
-- =============================================================================
-- Note: Run this manually if pg_cron extension is enabled:
-- SELECT cron.schedule('cleanup-rate-limits', '*/15 * * * *', 'SELECT cleanup_expired_rate_limits()');
