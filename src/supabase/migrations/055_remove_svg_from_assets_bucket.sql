-- Migration: Remove SVG from assets bucket allowed MIME types
-- Created: 2024-12-21
-- Issue: SVG files can contain embedded JavaScript (XSS risk)
-- Note: If you need SVG support, ensure proper sanitization on upload

UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'assets';
