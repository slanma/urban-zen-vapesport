REVOKE ALL ON TABLE public.product_overrides FROM anon;
GRANT SELECT ON TABLE public.product_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_overrides TO authenticated;
GRANT ALL ON TABLE public.product_overrides TO service_role;