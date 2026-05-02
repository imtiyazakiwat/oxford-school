-- Migration: Add year column to gallery table
-- Created: 2025-12-20

-- Add year column to gallery table
ALTER TABLE gallery ADD COLUMN year INTEGER;

-- Create index for year filtering
CREATE INDEX idx_gallery_year ON gallery(year);

-- Set default year for existing records (extract from created_at)
UPDATE gallery SET year = EXTRACT(YEAR FROM created_at)::INTEGER WHERE year IS NULL;
