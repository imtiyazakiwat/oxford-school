-- Migration: Add search_path to handle_updated_at function
-- Created: December 2024
-- Issue: handle_updated_at() is SECURITY INVOKER without search_path set
-- This could allow search_path manipulation attacks

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
