-- Migration: Fix function permissions properly
-- Created: 2024-12-21
-- Issue: Functions inherit EXECUTE from public role, need to revoke from public first

-- First, revoke from public role (which anon/authenticated inherit from)
REVOKE EXECUTE ON FUNCTION is_admin(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION get_user_role(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION check_rate_limit(text, text, integer, integer) FROM public;
REVOKE EXECUTE ON FUNCTION cleanup_expired_otps() FROM public;
REVOKE EXECUTE ON FUNCTION cleanup_old_audit_logs() FROM public;
REVOKE EXECUTE ON FUNCTION audit_trigger_func() FROM public;
REVOKE EXECUTE ON FUNCTION prevent_student_sensitive_update() FROM public;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM public;
REVOKE EXECUTE ON FUNCTION handle_updated_at() FROM public;
REVOKE EXECUTE ON FUNCTION get_masked_aadhar(text) FROM public;

-- Now grant back only to the roles that need them

-- is_admin and get_user_role: needed by authenticated for RLS policies
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;

-- Service role needs access to all functions
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION check_rate_limit(text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_otps() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs() TO service_role;
GRANT EXECUTE ON FUNCTION get_masked_aadhar(text) TO service_role;

-- Trigger functions need to be executable by the roles that trigger them
-- audit_trigger_func is called on INSERT/UPDATE/DELETE by authenticated users
GRANT EXECUTE ON FUNCTION audit_trigger_func() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_trigger_func() TO service_role;

-- prevent_student_sensitive_update is called on UPDATE by authenticated users
GRANT EXECUTE ON FUNCTION prevent_student_sensitive_update() TO authenticated;
GRANT EXECUTE ON FUNCTION prevent_student_sensitive_update() TO service_role;

-- handle_new_user is called by auth trigger (service_role context only)
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;
-- Note: Do NOT grant to authenticated - this is an internal auth function

-- handle_updated_at is called on UPDATE by authenticated users
GRANT EXECUTE ON FUNCTION handle_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_updated_at() TO service_role;

-- get_masked_aadhar: only authenticated users should see masked aadhar
GRANT EXECUTE ON FUNCTION get_masked_aadhar(text) TO authenticated;
