
-- Revoke PUBLIC execute on the helper function
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;

-- Only service_role needs to access it for RLS checks in some contexts, 
-- but let's give authenticated access if needed (or restrict to service_role).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
