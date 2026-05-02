-- Migration: Revoke excessive privileges from authenticated role
-- Created: December 2024
-- Issue: authenticated role has TRUNCATE, TRIGGER, REFERENCES on all tables
-- Any logged-in user could potentially truncate tables

-- Revoke dangerous privileges from all public tables
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.users FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.roles FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.user_roles FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.students FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.applications FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.achievers FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.gallery FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.announcements FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.news FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.events FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.about_images FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.contact_submissions FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.marquee_messages FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.admission_banner FROM authenticated;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.otp_verifications FROM authenticated;
