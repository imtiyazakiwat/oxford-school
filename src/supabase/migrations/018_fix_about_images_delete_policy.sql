-- Migration: Add missing DELETE policy for about_images table
-- Created: December 2024
-- Issue: No DELETE policy existed - admins couldn't delete images via RLS

-- Policy: Only admins can delete about images
CREATE POLICY "Admins can delete about images" ON about_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
