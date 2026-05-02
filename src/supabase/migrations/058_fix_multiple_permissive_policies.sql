-- Migration: Fix multiple permissive policies by splitting ALL into specific operations
-- Created: 2024-12-21
-- Issue: ALL policy + SELECT policy = multiple permissive policies for SELECT

-- Fix admission_banner: Replace ALL with specific INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Admins can manage admission banner" ON admission_banner;
DROP POLICY IF EXISTS "Public can read active admission banner" ON admission_banner;

-- Single SELECT policy that handles both public (active only) and admin (all)
CREATE POLICY "Select admission banner" ON admission_banner
FOR SELECT USING (
  is_active = true 
  OR is_admin((SELECT auth.uid()))
);

-- Separate policies for write operations (admin only)
CREATE POLICY "Admin insert admission banner" ON admission_banner
FOR INSERT WITH CHECK (is_admin((SELECT auth.uid())));

CREATE POLICY "Admin update admission banner" ON admission_banner
FOR UPDATE 
USING (is_admin((SELECT auth.uid())))
WITH CHECK (is_admin((SELECT auth.uid())));

CREATE POLICY "Admin delete admission banner" ON admission_banner
FOR DELETE USING (is_admin((SELECT auth.uid())));

-- Fix marquee_messages: Same pattern
DROP POLICY IF EXISTS "Admins can manage marquee messages" ON marquee_messages;
DROP POLICY IF EXISTS "Public can read active marquee messages" ON marquee_messages;

-- Single SELECT policy
CREATE POLICY "Select marquee messages" ON marquee_messages
FOR SELECT USING (
  is_active = true 
  OR is_admin((SELECT auth.uid()))
);

-- Separate policies for write operations (admin only)
CREATE POLICY "Admin insert marquee messages" ON marquee_messages
FOR INSERT WITH CHECK (is_admin((SELECT auth.uid())));

CREATE POLICY "Admin update marquee messages" ON marquee_messages
FOR UPDATE 
USING (is_admin((SELECT auth.uid())))
WITH CHECK (is_admin((SELECT auth.uid())));

CREATE POLICY "Admin delete marquee messages" ON marquee_messages
FOR DELETE USING (is_admin((SELECT auth.uid())));
