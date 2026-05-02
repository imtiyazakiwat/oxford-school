-- Migration: Add audit log cleanup function
-- Created: December 2024
-- Purpose: Auto-cleanup old audit logs (90 day retention)
-- Usage: Call via pg_cron or scheduled function

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM audit_log WHERE changed_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Note: To enable automatic cleanup, set up pg_cron:
-- SELECT cron.schedule('cleanup-audit-logs', '0 3 * * *', 'SELECT cleanup_old_audit_logs()');
