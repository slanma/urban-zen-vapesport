GRANT SELECT, INSERT, UPDATE ON public.b2b_profiles TO authenticated;
GRANT ALL ON public.b2b_profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT EXECUTE ON FUNCTION public.get_b2b_status(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- Approve the project owner's B2B account so they can log in
UPDATE public.b2b_profiles SET status='approved' WHERE user_id='d22d89b9-874c-4f9f-b25b-14c3b4f8ac00';