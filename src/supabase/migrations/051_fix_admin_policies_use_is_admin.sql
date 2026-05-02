-- Migration: Fix admin policies to use is_admin() function
-- Created: December 2024
-- Issue: Admin policies reference user_roles table directly, which anon role can't access
--        This causes 401 errors even for public SELECT queries
-- Fix: Use is_admin() SECURITY DEFINER function which bypasses permission checks

-- Fix marquee_messages admin policy
DROP POLICY IF EXISTS "Admins can manage marquee messages" ON marquee_messages;
CREATE POLICY "Admins can manage marquee messages" ON marquee_messages
  FOR ALL USING (is_admin((SELECT auth.uid())));

-- Fix admission_banner admin policy  
DROP POLICY IF EXISTS "Admins can manage admission banner" ON admission_banner;
CREATE POLICY "Admins can manage admission banner" ON admission_banner
  FOR ALL USING (is_admin((SELECT auth.uid())));
