-- Migration: Create rate_limits table for DB-level abuse prevention
-- Created: December 2024
-- Purpose: Track and limit repeated actions (login attempts, form submissions, etc.)

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,           -- IP address, email, or user_id
  action TEXT NOT NULL,               -- 'login', 'contact_form', 'application', 'otp_request'
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, action)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_action ON rate_limits(action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Block all client access - only service_role can manage rate limits
CREATE POLICY "Block client access to rate_limits" ON rate_limits
  FOR ALL USING (false);

-- Function to check and increment rate limit
-- Returns TRUE if within limit, FALSE if exceeded
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Get current rate limit record
  SELECT count, window_start INTO v_count, v_window_start
  FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, NOW());
    RETURN TRUE;
  END IF;

  -- If window has expired, reset the counter
  IF v_window_start < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
    UPDATE rate_limits
    SET count = 1, window_start = NOW()
    WHERE identifier = p_identifier AND action = p_action;
    RETURN TRUE;
  END IF;

  -- If within window and under limit, increment
  IF v_count < p_max_attempts THEN
    UPDATE rate_limits
    SET count = count + 1
    WHERE identifier = p_identifier AND action = p_action;
    RETURN TRUE;
  END IF;

  -- Rate limit exceeded
  RETURN FALSE;
END;
$$;

-- Function to reset rate limit (e.g., after successful login)
CREATE OR REPLACE FUNCTION reset_rate_limit(p_identifier TEXT, p_action TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action;
END;
$$;

-- Function to cleanup old rate limit records (run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$;

-- Grant execute to authenticated for the check function (used in RLS policies)
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO anon;
