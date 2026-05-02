-- Migration: Setup pg_cron for automatic cleanup jobs
-- Created: December 2024
-- Purpose: Schedule automatic cleanup of audit logs and rate limits
-- Note: pg_cron must be enabled in Supabase Dashboard first

-- Enable pg_cron extension (run in Supabase Dashboard SQL Editor)
-- CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Schedule audit log cleanup - runs daily at 3 AM UTC
-- Keeps 90 days of audit logs
-- SELECT cron.schedule(
--   'cleanup-audit-logs',
--   '0 3 * * *',
--   $$DELETE FROM public.audit_log WHERE changed_at < NOW() - INTERVAL '90 days'$$
-- );

-- Schedule rate limits cleanup - runs every hour
-- Removes entries older than 24 hours
-- SELECT cron.schedule(
--   'cleanup-rate-limits',
--   '0 * * * *',
--   $$DELETE FROM public.rate_limits WHERE window_start < NOW() - INTERVAL '24 hours'$$
-- );

-- Schedule expired OTP cleanup - runs every 15 minutes
-- SELECT cron.schedule(
--   'cleanup-expired-otps',
--   '*/15 * * * *',
--   $$DELETE FROM public.otp_verifications WHERE expires_at < NOW() OR verified = TRUE$$
-- );

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule a job:
-- SELECT cron.unschedule('cleanup-audit-logs');

-- MANUAL SETUP REQUIRED:
-- 1. Go to Supabase Dashboard → Database → Extensions
-- 2. Enable pg_cron extension
-- 3. Run the SELECT cron.schedule(...) commands above in SQL Editor
