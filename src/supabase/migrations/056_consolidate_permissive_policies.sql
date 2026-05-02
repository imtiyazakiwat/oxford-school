-- Migration: Consolidate multiple permissive SELECT policies
-- Created: 2024-12-21
-- Issue: Multiple permissive policies for same role/action cause performance overhead

-- Fix admission_banner: Combine public read + admin read into one policy
DROP POLICY IF EXISTS "Anyone can read active admission banner" ON admission_banner;
-- The "Admins can manage admission banner" ALL policy already covers admin SELECT
-- So we just need a public read for active items
CREATE POLICY "Public can read active admission banner" ON admission_banner
FOR SELECT 
USING (is_active = true);

-- Fix marquee_messages: Same pattern
DROP POLICY IF EXISTS "Anyone can read active marquee messages" ON marquee_messages;
CREATE POLICY "Public can read active marquee messages" ON marquee_messages
FOR SELECT 
USING (is_active = true);
