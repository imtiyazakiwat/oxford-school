-- Migration: Encrypt Aadhar numbers using pgcrypto
-- Created: December 2024
-- Purpose: PII protection for sensitive Aadhar numbers in students and applications tables
-- Note: pgcrypto extension is already enabled in Supabase

-- Add encrypted columns to store Aadhar numbers
ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhar_encrypted BYTEA;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS aadhar_encrypted BYTEA;

-- Create encryption key in vault (run once manually or via dashboard)
-- INSERT INTO vault.secrets (secret, name) VALUES ('your-32-char-encryption-key-here', 'aadhar_encryption_key');

-- Function to encrypt Aadhar number
CREATE OR REPLACE FUNCTION encrypt_aadhar(plain_aadhar TEXT, encryption_key TEXT)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF plain_aadhar IS NULL OR plain_aadhar = '' THEN
    RETURN NULL;
  END IF;
  RETURN extensions.pgp_sym_encrypt(plain_aadhar, encryption_key);
END;
$$;

-- Function to decrypt Aadhar number (only for admins)
CREATE OR REPLACE FUNCTION decrypt_aadhar(encrypted_aadhar BYTEA, encryption_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Only allow admins to decrypt
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ) THEN
    RETURN '****-****-****'; -- Masked value for non-admins
  END IF;
  
  IF encrypted_aadhar IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN extensions.pgp_sym_decrypt(encrypted_aadhar, encryption_key);
END;
$$;

-- Function to get masked Aadhar (last 4 digits only)
CREATE OR REPLACE FUNCTION get_masked_aadhar(plain_aadhar TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF plain_aadhar IS NULL OR length(plain_aadhar) < 4 THEN
    RETURN NULL;
  END IF;
  RETURN 'XXXX-XXXX-' || right(plain_aadhar, 4);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION encrypt_aadhar TO authenticated;
GRANT EXECUTE ON FUNCTION decrypt_aadhar TO authenticated;
GRANT EXECUTE ON FUNCTION get_masked_aadhar TO authenticated;

-- Note: To migrate existing data, run this after setting up the encryption key:
-- UPDATE students SET aadhar_encrypted = encrypt_aadhar(aadhar_number, 'your-key') WHERE aadhar_number IS NOT NULL;
-- UPDATE applications SET aadhar_encrypted = encrypt_aadhar(aadhar_number, 'your-key') WHERE aadhar_number IS NOT NULL;
-- Then optionally: ALTER TABLE students DROP COLUMN aadhar_number;
