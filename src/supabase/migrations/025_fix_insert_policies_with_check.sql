-- Migration: Fix INSERT policies to include WITH CHECK validation
-- Created: December 2024
-- Issue: Several admin INSERT policies had no WITH CHECK clause

-- about_images: Add WITH CHECK to INSERT policy
DROP POLICY IF EXISTS "Admins can insert about images" ON about_images;
CREATE POLICY "Admins can insert about images" ON about_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- announcements: Add WITH CHECK to INSERT policy  
DROP POLICY IF EXISTS "Admins can insert announcements" ON announcements;
CREATE POLICY "Admins can insert announcements" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- events: Add WITH CHECK to INSERT policy
DROP POLICY IF EXISTS "Admins can insert events" ON events;
CREATE POLICY "Admins can insert events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- gallery: Add WITH CHECK to INSERT policy
DROP POLICY IF EXISTS "Admins can insert gallery images" ON gallery;
CREATE POLICY "Admins can insert gallery images" ON gallery
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- news: Add WITH CHECK to INSERT policy
DROP POLICY IF EXISTS "Admins can insert news" ON news;
CREATE POLICY "Admins can insert news" ON news
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- students: Add WITH CHECK to INSERT policy
DROP POLICY IF EXISTS "Admins can insert students" ON students;
CREATE POLICY "Admins can insert students" ON students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
