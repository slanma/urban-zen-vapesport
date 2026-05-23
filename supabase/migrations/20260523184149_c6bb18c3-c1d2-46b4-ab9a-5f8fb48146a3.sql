
-- 1) Hide b2b_price column from public reads. Only admins or approved B2B partners can fetch it via RPC.
REVOKE SELECT (b2b_price) ON public.product_overrides FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_product_b2b_prices()
RETURNS TABLE(product_id text, b2b_price integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT po.product_id, po.b2b_price
  FROM public.product_overrides po
  WHERE po.b2b_price IS NOT NULL
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.get_b2b_status(auth.uid()) = 'approved'::b2b_status
    );
$$;

REVOKE EXECUTE ON FUNCTION public.get_product_b2b_prices() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_product_b2b_prices() TO authenticated;

-- 2) Lock down user_roles: explicit admin-only INSERT / UPDATE / DELETE policies.
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
