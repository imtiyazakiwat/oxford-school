-- Migration: Add description column to audit_log table
-- Created: January 2026
-- Purpose: Fix OTP audit logging which requires a description column

-- Add the missing description column to audit_log table
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS description TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN audit_log.description IS 'Human-readable description of the audit event';
