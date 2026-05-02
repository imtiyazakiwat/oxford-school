-- Migration: Add basic validation to application INSERT policy
-- Created: December 2024
-- Issue: "Anyone can submit application" has WITH CHECK (true) - no validation
-- Adding basic field validation at database level as defense-in-depth

DROP POLICY IF EXISTS "Anyone can submit application" ON applications;

CREATE POLICY "Anyone can submit application" ON applications
  FOR INSERT WITH CHECK (
    -- Required fields must not be null/empty
    first_name IS NOT NULL AND length(trim(first_name)) > 0
    AND last_name IS NOT NULL AND length(trim(last_name)) > 0
    AND email IS NOT NULL AND length(trim(email)) > 0
    AND phone IS NOT NULL AND length(trim(phone)) > 0
    AND father_name IS NOT NULL AND length(trim(father_name)) > 0
    AND mother_name IS NOT NULL AND length(trim(mother_name)) > 0
    AND emergency_contact IS NOT NULL AND length(trim(emergency_contact)) > 0
    AND applying_for_class IS NOT NULL
    AND academic_year IS NOT NULL
    AND current_address IS NOT NULL AND length(trim(current_address)) > 0
    AND date_of_birth IS NOT NULL
    AND gender IS NOT NULL
    -- Length limits to prevent abuse
    AND length(first_name) <= 100
    AND length(last_name) <= 100
    AND length(email) <= 255
    AND length(phone) <= 20
    -- Status must be pending for new applications
    AND (status IS NULL OR status = 'pending')
    -- Prevent setting admin-only fields
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND rejection_reason IS NULL
  );
