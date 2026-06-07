REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_b2b_status(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_product_b2b_prices() FROM anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_b2b_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_b2b_status(uuid) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_product_b2b_prices() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_b2b_prices() TO service_role;