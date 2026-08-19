
-- Revoke all access from everyone including authenticated
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

-- SECURITY DEFINER functions run as their creator (usually postgres/service_role). 
-- RLS policies can still use them without the user having explicit EXECUTE rights.
