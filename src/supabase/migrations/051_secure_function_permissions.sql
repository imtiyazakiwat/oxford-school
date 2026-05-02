-- Migration: Secure function permissions
-- Created: 2024-12-21
-- Issue: Functions like is_admin() are callable by anon, allowing user enumeration

-- Revoke execute permissions from anon on sensitive functions
REVOKE EXECUTE ON FUNCTION is_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION get_user_role(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION cleanup_expired_otps() FROM anon;
REVOKE EXECUTE ON FUNCTION cleanup_old_audit_logs() FROM anon;

-- Keep authenticated access for is_admin and get_user_role (needed for RLS)
-- These are already granted by default, but being explicit
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;

-- Cleanup functions should only be callable by service_role (for cron jobs)
REVOKE EXECUTE ON FUNCTION cleanup_expired_otps() FROM authenticated;
REVOKE EXECUTE ON FUNCTION cleanup_old_audit_logs() FROM authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_otps() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs() TO service_role;

-- check_rate_limit needs special handling - it's used by API routes via service_role
-- Revoke from anon and authenticated, only service_role should call it
REVOKE EXECUTE ON FUNCTION check_rate_limit(text, text, integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION check_rate_limit(text, text, integer, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(text, text, integer, integer) TO service_role;

-- Trigger functions don't need direct execute permissions (they run as SECURITY DEFINER)
-- But let's be explicit about revoking direct access
REVOKE EXECUTE ON FUNCTION audit_trigger_func() FROM anon;
REVOKE EXECUTE ON FUNCTION prevent_student_sensitive_update() FROM anon;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;

-- handle_updated_at is safe (just updates timestamp) but no need for anon access
REVOKE EXECUTE ON FUNCTION handle_updated_at() FROM anon;

-- get_masked_aadhar should only be accessible to authenticated users
REVOKE EXECUTE ON FUNCTION get_masked_aadhar(text) FROM anon;
GRANT EXECUTE ON FUNCTION get_masked_aadhar(text) TO authenticated;
