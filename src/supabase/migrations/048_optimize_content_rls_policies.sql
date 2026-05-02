-- Migration: Optimize content table RLS policies for performance
-- Created: 2025-12-21
-- Performance: Wrap auth.uid() in (SELECT ...) to prevent re-evaluation per row

-- ============================================
-- ACHIEVERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can insert achievers" ON public.achievers;
CREATE POLICY "Admins can insert achievers" ON public.achievers
  FOR INSERT
  WITH CHECK (is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can update achievers" ON public.achievers;
CREATE POLICY "Admins can update achievers" ON public.achievers
  FOR UPDATE
  USING (is_admin((SELECT auth.uid())))
  WITH CHECK (is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can delete achievers" ON public.achievers;
CREATE POLICY "Admins can delete achievers" ON public.achievers
  FOR DELETE
  USING (is_admin((SELECT auth.uid())));

-- ============================================
-- GALLERY TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can insert gallery images" ON public.gallery;
CREATE POLICY "Admins can insert gallery images" ON public.gallery
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update gallery images" ON public.gallery;
CREATE POLICY "Admins can update gallery images" ON public.gallery
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete gallery images" ON public.gallery;
CREATE POLICY "Admins can delete gallery images" ON public.gallery
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can insert announcements" ON public.announcements;
CREATE POLICY "Admins can insert announcements" ON public.announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
CREATE POLICY "Admins can update announcements" ON public.announcements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;
CREATE POLICY "Admins can delete announcements" ON public.announcements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

-- ============================================
-- NEWS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
CREATE POLICY "Admins can insert news" ON public.news
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update news" ON public.news;
CREATE POLICY "Admins can update news" ON public.news
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
CREATE POLICY "Admins can delete news" ON public.news
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

-- ============================================
-- EVENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events" ON public.events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events" ON public.events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

-- ============================================
-- ABOUT_IMAGES TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can insert about images" ON public.about_images;
CREATE POLICY "Admins can insert about images" ON public.about_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update about images" ON public.about_images;
CREATE POLICY "Admins can update about images" ON public.about_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete about images" ON public.about_images;
CREATE POLICY "Admins can delete about images" ON public.about_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

-- ============================================
-- CONTACT_SUBMISSIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can delete contact submissions" ON public.contact_submissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

-- ============================================
-- MARQUEE_MESSAGES TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can manage marquee messages" ON public.marquee_messages;
CREATE POLICY "Admins can manage marquee messages" ON public.marquee_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

-- ============================================
-- ADMISSION_BANNER TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can manage admission banner" ON public.admission_banner;
CREATE POLICY "Admins can manage admission banner" ON public.admission_banner
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );
