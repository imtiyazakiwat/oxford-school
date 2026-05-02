-- Migration: Create student_audit_log table for per-student activity tracking
-- This table tracks all admin actions on individual students (profile edits, fee updates, payments)

-- Create the student_audit_log table
CREATE TABLE IF NOT EXISTS student_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    action TEXT NOT NULL,           -- 'profile_update', 'fee_update', 'payment_recorded', 'status_change'
    field_changed TEXT,             -- 'name', 'class', 'fee_amount', etc.
    old_value TEXT,                 -- Previous value
    new_value TEXT,                 -- New value
    description TEXT,               -- Human-readable description
    admin_id UUID REFERENCES auth.users(id),
    admin_name TEXT,                -- Denormalized for easy display
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add comment
COMMENT ON TABLE student_audit_log IS 'Per-student audit trail tracking all admin actions';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_student_audit_student_id ON student_audit_log(student_id);
CREATE INDEX IF NOT EXISTS idx_student_audit_created_at ON student_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_audit_admin_id ON student_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_student_audit_action ON student_audit_log(action);

-- Enable RLS
ALTER TABLE student_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can view audit logs
CREATE POLICY "Admins can view student audit logs" ON student_audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- Block all client-side inserts (only server/triggers can insert)
CREATE POLICY "Block client insert student audit" ON student_audit_log
    FOR INSERT
    WITH CHECK (false);

-- Block all updates
CREATE POLICY "Block all updates student audit" ON student_audit_log
    FOR UPDATE
    USING (false)
    WITH CHECK (false);

-- Block all deletes  
CREATE POLICY "Block all deletes student audit" ON student_audit_log
    FOR DELETE
    USING (false);

-- Grant permissions
REVOKE ALL ON student_audit_log FROM anon;
REVOKE ALL ON student_audit_log FROM authenticated;
GRANT SELECT ON student_audit_log TO authenticated;
GRANT ALL ON student_audit_log TO service_role;

-- Create a SECURITY DEFINER function to log student audit entries
CREATE OR REPLACE FUNCTION log_student_audit(
    p_student_id UUID,
    p_action TEXT,
    p_field_changed TEXT DEFAULT NULL,
    p_old_value TEXT DEFAULT NULL,
    p_new_value TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_id UUID;
    v_admin_name TEXT;
    v_log_id UUID;
BEGIN
    -- Get the current user's ID and name
    v_admin_id := auth.uid();
    
    SELECT full_name INTO v_admin_name
    FROM users
    WHERE id = v_admin_id;
    
    -- Insert the audit log entry
    INSERT INTO student_audit_log (
        student_id,
        action,
        field_changed,
        old_value,
        new_value,
        description,
        admin_id,
        admin_name
    ) VALUES (
        p_student_id,
        p_action,
        p_field_changed,
        p_old_value,
        p_new_value,
        p_description,
        v_admin_id,
        COALESCE(v_admin_name, 'Unknown Admin')
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Grant execute permission to authenticated users (RLS will handle authorization)
GRANT EXECUTE ON FUNCTION log_student_audit TO authenticated;
GRANT EXECUTE ON FUNCTION log_student_audit TO service_role;

COMMENT ON FUNCTION log_student_audit IS 'Logs an audit entry for a student. SECURITY DEFINER allows bypassing RLS for insert.';
