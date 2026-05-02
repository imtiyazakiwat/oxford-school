-- Migration: Add foreign key constraint for students.user_id
-- Created: December 2024
-- Issue: students.user_id had no FK to auth.users, allowing orphaned records

ALTER TABLE public.students 
ADD CONSTRAINT students_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
