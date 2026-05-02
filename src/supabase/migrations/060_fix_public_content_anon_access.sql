-- Migration: Fix anonymous access to public content tables
-- Created: December 2024
-- Issue: anon role cannot execute is_admin() function, causing 401 errors
-- Solution: Simplify SELECT policies for public content to not require is_admin check

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Select marquee messages" ON marquee_messages;
DROP POLICY IF EXISTS "Select admission banner" ON admission_banner;

-- Create new SELECT policies that work for anon users
-- Public users can only see active content
-- Admins (authenticated) can see all content via the is_admin check

-- Marquee messages: anyone can see active, admins can see all
CREATE POLICY "Public can view active marquee messages" ON marquee_messages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all marquee messages" ON marquee_messages
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Admission banner: anyone can see active, admins can see all  
CREATE POLICY "Public can view active admission banner" ON admission_banner
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all admission banner" ON admission_banner
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));
