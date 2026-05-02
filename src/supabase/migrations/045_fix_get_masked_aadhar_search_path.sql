-- Migration: Fix get_masked_aadhar function search_path
-- Created: 2025-12-21
-- Security: Prevents search path injection attacks

-- Recreate function with proper search_path
CREATE OR REPLACE FUNCTION public.get_masked_aadhar(p text)
RETURNS text
LANGUAGE sql
SECURITY INVOKER
SET search_path = 'public'
AS $function$
  SELECT CASE 
    WHEN p IS NULL THEN NULL
    ELSE 'XXXX-XXXX-' || RIGHT(p, 4)
  END;
$function$;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_masked_aadhar(text) IS 
  'Returns masked Aadhar number showing only last 4 digits. Security: INVOKER with fixed search_path.';
