-- Migration: Add validation to contact_submissions INSERT policy
-- Created: December 2024
-- Issue: "Anyone can submit contact form" has WITH CHECK (true) - no validation
-- Risk: Spam/abuse potential without any field validation

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;

-- Create policy with proper validation
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (
    -- Required fields must not be null/empty
    full_name IS NOT NULL 
    AND length(trim(full_name)) >= 2 
    AND length(full_name) <= 100
    
    -- Email validation (basic format check)
    AND email IS NOT NULL 
    AND length(trim(email)) >= 5
    AND length(email) <= 255
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    
    -- Subject validation
    AND subject IS NOT NULL 
    AND length(trim(subject)) >= 3 
    AND length(subject) <= 200
    
    -- Message validation
    AND message IS NOT NULL 
    AND length(trim(message)) >= 10 
    AND length(message) <= 5000
    
    -- Phone is optional but if provided, limit length
    AND (phone IS NULL OR length(phone) <= 20)
    
    -- Status must be 'new' for new submissions (prevent status manipulation)
    AND (status IS NULL OR status = 'new')
  );
