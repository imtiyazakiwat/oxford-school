-- Migration: Add audit logging for OTP verifications
-- Created: December 2024
-- Purpose: Track OTP creation and verification attempts for security monitoring

-- =============================================================================
-- THREAT MODEL
-- =============================================================================
-- Without audit logging on OTP table, we cannot:
-- 1. Detect brute force attempts at database level
-- 2. Investigate account takeover attempts
-- 3. Identify patterns of abuse
-- This migration adds audit triggers to capture all OTP operations

-- =============================================================================
-- AUDIT TRIGGER FUNCTION FOR OTP
-- =============================================================================
CREATE OR REPLACE FUNCTION otp_audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
DECLARE
  v_description TEXT;
BEGIN
  -- Generate description based on action
  IF TG_OP = 'INSERT' THEN
    v_description := 'OTP created for email: ' || LEFT(NEW.email, 3) || '***';
    INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by, description)
    VALUES ('otp_verifications', NEW.id, 'INSERT', 
            jsonb_build_object('email_masked', LEFT(NEW.email, 3) || '***', 'expires_at', NEW.expires_at),
            COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
            v_description);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Track verification attempts and status changes
    IF OLD.verified = false AND NEW.verified = true THEN
      v_description := 'OTP verified successfully';
    ELSIF NEW.attempts > OLD.attempts THEN
      v_description := 'OTP verification attempt failed (attempt ' || NEW.attempts || ')';
    ELSE
      v_description := 'OTP record updated';
    END IF;
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by, description)
    VALUES ('otp_verifications', NEW.id, 'UPDATE',
            jsonb_build_object('verified', OLD.verified, 'attempts', OLD.attempts),
            jsonb_build_object('verified', NEW.verified, 'attempts', NEW.attempts),
            COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
            v_description);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_description := 'OTP record deleted (consumed or expired)';
    INSERT INTO audit_log (table_name, record_id, action, old_data, changed_by, description)
    VALUES ('otp_verifications', OLD.id, 'DELETE',
            jsonb_build_object('email_masked', LEFT(OLD.email, 3) || '***', 'verified', OLD.verified),
            COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
            v_description);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$;

-- =============================================================================
-- ATTACH TRIGGER TO OTP TABLE
-- =============================================================================
DROP TRIGGER IF EXISTS audit_otp_verifications ON otp_verifications;
CREATE TRIGGER audit_otp_verifications
  AFTER INSERT OR UPDATE OR DELETE ON otp_verifications
  FOR EACH ROW EXECUTE FUNCTION otp_audit_trigger_func();

-- =============================================================================
-- SECURE FUNCTION PERMISSIONS
-- =============================================================================
REVOKE EXECUTE ON FUNCTION otp_audit_trigger_func() FROM public;
REVOKE EXECUTE ON FUNCTION otp_audit_trigger_func() FROM anon;
REVOKE EXECUTE ON FUNCTION otp_audit_trigger_func() FROM authenticated;
GRANT EXECUTE ON FUNCTION otp_audit_trigger_func() TO service_role;

-- =============================================================================
-- COMMENT
-- =============================================================================
COMMENT ON FUNCTION otp_audit_trigger_func() IS 
  'Security audit trigger for OTP verifications - tracks creation, verification attempts, and consumption';
