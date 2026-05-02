-- Migration: Add file size limit and MIME type restrictions to assets bucket
-- Created: December 2024
-- Issue: assets bucket has no file_size_limit - storage abuse risk

UPDATE storage.buckets 
SET 
  file_size_limit = 10485760, -- 10MB max
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
WHERE id = 'assets';
