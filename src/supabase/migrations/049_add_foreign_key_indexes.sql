-- Migration: Add indexes for foreign keys
-- Created: 2025-12-21
-- Performance: Improves RLS policy evaluation and JOIN performance

-- user_roles table
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- students table
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_application_id ON public.students(application_id);

-- Content tables - created_by foreign keys
CREATE INDEX IF NOT EXISTS idx_achievers_created_by ON public.achievers(created_by);
CREATE INDEX IF NOT EXISTS idx_gallery_created_by ON public.gallery(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_news_created_by ON public.news(created_by);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_marquee_messages_created_by ON public.marquee_messages(created_by);

-- updated_by foreign keys
CREATE INDEX IF NOT EXISTS idx_about_images_updated_by ON public.about_images(updated_by);
CREATE INDEX IF NOT EXISTS idx_admission_banner_updated_by ON public.admission_banner(updated_by);

-- Audit log indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
