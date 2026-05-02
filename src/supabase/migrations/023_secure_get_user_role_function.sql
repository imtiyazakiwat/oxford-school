-- Migration: Secure get_user_role function
-- Created: December 2024
-- Issue: Any user could query any other user's role (information disclosure)

-- Replace function to only allow querying own role or admin querying any role
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

CREATE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result TEXT;
BEGIN
  -- User can query their own role
  IF user_uuid = auth.uid() THEN
    SELECT r.name INTO result
    FROM public.roles r
    INNER JOIN public.user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = user_uuid
    LIMIT 1;
    RETURN result;
  END IF;
  
  -- Admin can query any user's role
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ) THEN
    SELECT r.name INTO result
    FROM public.roles r
    INNER JOIN public.user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = user_uuid
    LIMIT 1;
    RETURN result;
  END IF;
  
  -- Otherwise return NULL (unauthorized)
  RETURN NULL;
END;
$$;
