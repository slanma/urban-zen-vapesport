GRANT SELECT, INSERT, UPDATE ON public.b2b_profiles TO authenticated;
GRANT ALL ON public.b2b_profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT EXECUTE ON FUNCTION public.get_b2b_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_b2b_status(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;