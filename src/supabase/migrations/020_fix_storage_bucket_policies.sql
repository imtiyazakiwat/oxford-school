-- Migration: Add missing storage bucket policies
-- Created: December 2024
-- Issue: assets and profile_images buckets have no RLS policies

-- =============================================
-- profile_images bucket policies
-- =============================================

-- Users can upload their own profile image (folder structure: {user_id}/filename)
CREATE POLICY "Users can upload own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile_images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own profile image
CREATE POLICY "Users can view own profile image"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile_images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own profile image
CREATE POLICY "Users can update own profile image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile_images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile_images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own profile image
CREATE POLICY "Users can delete own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile_images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- assets bucket policies (public bucket for static assets)
-- =============================================

-- Public read access for assets
CREATE POLICY "Public read access for assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Only admins can upload to assets bucket
CREATE POLICY "Admins can upload to assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets' 
  AND public.is_admin(auth.uid())
);

-- Only admins can update assets
CREATE POLICY "Admins can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'assets' 
  AND public.is_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'assets' 
  AND public.is_admin(auth.uid())
);

-- Only admins can delete from assets
CREATE POLICY "Admins can delete from assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'assets' 
  AND public.is_admin(auth.uid())
);
