-- Migration: Add WITH CHECK to UPDATE policies
-- Created: December 2024
-- Issue: Several admin UPDATE policies lack WITH CHECK clause
-- This ensures data validation on both read and write

-- =============================================
-- about_images
-- =============================================
DROP POLICY IF EXISTS "Admins can update about images" ON about_images;
CREATE POLICY "Admins can update about images" ON about_images
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ));

-- =============================================
-- announcements
-- =============================================
DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;
CREATE POLICY "Admins can update announcements" ON announcements
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ));

-- =============================================
-- events
-- =============================================
DROP POLICY IF EXISTS "Admins can update events" ON events;
CREATE POLICY "Admins can update events" ON events
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ));

-- =============================================
-- gallery
-- =============================================
DROP POLICY IF EXISTS "Admins can update gallery images" ON gallery;
CREATE POLICY "Admins can update gallery images" ON gallery
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ));

-- =============================================
-- news
-- =============================================
DROP POLICY IF EXISTS "Admins can update news" ON news;
CREATE POLICY "Admins can update news" ON news
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ));

-- =============================================
-- contact_submissions
-- =============================================
DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
CREATE POLICY "Admins can update contact submissions" ON contact_submissions
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ));
