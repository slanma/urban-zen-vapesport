GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_b2b_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_b2b_status(uuid) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_product_b2b_prices() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_b2b_prices() TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.b2b_profiles TO authenticated;
GRANT ALL ON public.b2b_profiles TO service_role;

GRANT SELECT ON public.product_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_overrides TO authenticated;
GRANT ALL ON public.product_overrides TO service_role;

GRANT INSERT ON public.withdrawal_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.withdrawal_requests TO authenticated;
GRANT ALL ON public.withdrawal_requests TO service_role;