-- Migration: Revoke excessive privileges from anon role
-- Created: December 2024
-- Issue: anon role had full CRUD + TRUNCATE on all tables - defense in depth violation
-- Even with RLS, principle of least privilege requires minimal GRANTs

-- =============================================
-- SENSITIVE TABLES - Revoke dangerous privileges from anon
-- =============================================

-- applications: anon needs INSERT (submit) and SELECT (check status by email via RLS)
REVOKE UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.applications FROM anon;

-- students: anon should have NO access (all operations require authentication)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.students FROM anon;
REVOKE SELECT ON public.students FROM anon;

-- users: anon needs SELECT only (for public profiles), nothing else
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.users FROM anon;

-- user_roles: anon should have NO access (RBAC is internal)
REVOKE ALL ON public.user_roles FROM anon;

-- roles: anon should have NO access
REVOKE ALL ON public.roles FROM anon;

-- otp_verifications: anon should have NO access (server-side only via service_role)
REVOKE ALL ON public.otp_verifications FROM anon;

-- =============================================
-- ADMIN-MANAGED CONTENT TABLES - Revoke write access from anon
-- =============================================

-- achievers: anon needs SELECT only (public display)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.achievers FROM anon;

-- gallery: anon needs SELECT only
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.gallery FROM anon;

-- announcements: anon needs SELECT only
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.announcements FROM anon;

-- news: anon needs SELECT only
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.news FROM anon;

-- events: anon needs SELECT only
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.events FROM anon;

-- about_images: anon needs SELECT only
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.about_images FROM anon;

-- marquee_messages: anon needs SELECT only
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.marquee_messages FROM anon;

-- admission_banner: anon needs SELECT only
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.admission_banner FROM anon;

-- =============================================
-- PUBLIC SUBMISSION TABLES - Keep INSERT for anon
-- =============================================

-- contact_submissions: anon needs INSERT (submit form) only
REVOKE SELECT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.contact_submissions FROM anon;

-- =============================================
-- Summary of anon privileges after this migration:
-- =============================================
-- applications: SELECT, INSERT (submit application, view own by email)
-- students: NONE
-- users: SELECT (public profiles)
-- user_roles: NONE
-- roles: NONE
-- otp_verifications: NONE
-- achievers: SELECT
-- gallery: SELECT
-- announcements: SELECT
-- news: SELECT
-- events: SELECT
-- about_images: SELECT
-- marquee_messages: SELECT
-- admission_banner: SELECT
-- contact_submissions: INSERT
