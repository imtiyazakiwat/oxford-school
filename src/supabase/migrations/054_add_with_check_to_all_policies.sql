-- Migration: Add WITH CHECK to ALL policies missing it
-- Created: 2024-12-21
-- Issue: Some ALL policies don't have WITH CHECK clause

-- Fix admission_banner policy
DROP POLICY IF EXISTS "Admins can manage admission banner" ON admission_banner;
CREATE POLICY "Admins can manage admission banner" ON admission_banner
FOR ALL 
USING (is_admin((SELECT auth.uid())))
WITH CHECK (is_admin((SELECT auth.uid())));

-- Fix marquee_messages policy
DROP POLICY IF EXISTS "Admins can manage marquee messages" ON marquee_messages;
CREATE POLICY "Admins can manage marquee messages" ON marquee_messages
FOR ALL 
USING (is_admin((SELECT auth.uid())))
WITH CHECK (is_admin((SELECT auth.uid())));
