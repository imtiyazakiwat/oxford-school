-- Migration: Add admin access to profile_images bucket
-- Created: December 2024
-- Purpose: Allow admins to view all profile images for user management

CREATE POLICY "Admins can view all profile images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile_images' 
    AND EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
