-- Migration: Optimize RLS policies for performance
-- Created: 2025-12-21
-- Performance: Wrap auth.uid() in (SELECT ...) to prevent re-evaluation per row

-- ============================================
-- USERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users created via auth only" ON public.users;
CREATE POLICY "Users created via auth only" ON public.users
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users view own profile or admins view all" ON public.users;
CREATE POLICY "Users view own profile or admins view all" ON public.users
  FOR SELECT
  USING (
    id = (SELECT auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE
  USING (is_admin((SELECT auth.uid())));

-- ============================================
-- STUDENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Students view own or staff view all" ON public.students;
CREATE POLICY "Students view own or staff view all" ON public.students
  FOR SELECT
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'faculty'
    )
  );

DROP POLICY IF EXISTS "Students update own or admins update all" ON public.students;
CREATE POLICY "Students update own or admins update all" ON public.students
  FOR UPDATE
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert students" ON public.students;
CREATE POLICY "Admins can insert students" ON public.students
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete students" ON public.students;
CREATE POLICY "Admins can delete students" ON public.students
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

-- ============================================
-- USER_ROLES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
CREATE POLICY "Admins can insert user_roles" ON public.user_roles
  FOR INSERT
  WITH CHECK (is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can update user_roles" ON public.user_roles;
CREATE POLICY "Admins can update user_roles" ON public.user_roles
  FOR UPDATE
  USING (is_admin((SELECT auth.uid())))
  WITH CHECK (is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
CREATE POLICY "Admins can delete user_roles" ON public.user_roles
  FOR DELETE
  USING (is_admin((SELECT auth.uid())));

-- ============================================
-- ROLES TABLE
-- ============================================

DROP POLICY IF EXISTS "Only admins can view roles" ON public.roles;
CREATE POLICY "Only admins can view roles" ON public.roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert roles" ON public.roles;
CREATE POLICY "Admins can insert roles" ON public.roles
  FOR INSERT
  WITH CHECK (is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can update roles" ON public.roles;
CREATE POLICY "Admins can update roles" ON public.roles
  FOR UPDATE
  USING (is_admin((SELECT auth.uid())))
  WITH CHECK (is_admin((SELECT auth.uid())));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.roles;
CREATE POLICY "Admins can delete roles" ON public.roles
  FOR DELETE
  USING (is_admin((SELECT auth.uid())));

-- ============================================
-- APPLICATIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own application or admins view all" ON public.applications;
CREATE POLICY "Users can view own application or admins view all" ON public.applications
  FOR SELECT
  USING (
    email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
    OR created_user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
CREATE POLICY "Admins can update applications" ON public.applications
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

DROP POLICY IF EXISTS "Admins can delete applications" ON public.applications;
CREATE POLICY "Admins can delete applications" ON public.applications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );

-- ============================================
-- AUDIT_LOG TABLE
-- ============================================

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
CREATE POLICY "Admins can view audit logs" ON public.audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = (SELECT auth.uid()) AND r.name = 'admin'
    )
  );
