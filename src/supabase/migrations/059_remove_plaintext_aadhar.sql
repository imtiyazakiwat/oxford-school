-- Migration: Remove plaintext Aadhar columns for PII security
-- Created: December 2024
-- Issue: Aadhar numbers should only be stored encrypted, not in plaintext
-- This migration removes the plaintext columns after encryption migration

-- First, ensure all existing data is migrated to encrypted columns
-- (This should have been done in migration 043)

-- Drop plaintext Aadhar column from applications table
-- Only drop if the encrypted column exists and has data
DO $$
BEGIN
  -- Check if aadhar_encrypted column exists in applications
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'applications' 
    AND column_name = 'aadhar_encrypted'
    AND table_schema = 'public'
  ) THEN
    -- Drop the plaintext column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' 
      AND column_name = 'aadhar_number'
      AND table_schema = 'public'
    ) THEN
      ALTER TABLE applications DROP COLUMN aadhar_number;
      RAISE NOTICE 'Dropped aadhar_number column from applications table';
    END IF;
  ELSE
    RAISE NOTICE 'aadhar_encrypted column does not exist in applications - skipping';
  END IF;
END $$;

-- Drop plaintext Aadhar column from students table
DO $$
BEGIN
  -- Check if aadhar_encrypted column exists in students
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' 
    AND column_name = 'aadhar_encrypted'
    AND table_schema = 'public'
  ) THEN
    -- Drop the plaintext column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND column_name = 'aadhar_number'
      AND table_schema = 'public'
    ) THEN
      ALTER TABLE students DROP COLUMN aadhar_number;
      RAISE NOTICE 'Dropped aadhar_number column from students table';
    END IF;
  ELSE
    RAISE NOTICE 'aadhar_encrypted column does not exist in students - skipping';
  END IF;
END $$;

-- Add comment explaining the security measure
COMMENT ON COLUMN applications.aadhar_encrypted IS 'Encrypted Aadhar number using pgcrypto. Plaintext column removed for PII security.';
COMMENT ON COLUMN students.aadhar_encrypted IS 'Encrypted Aadhar number using pgcrypto. Plaintext column removed for PII security.';
