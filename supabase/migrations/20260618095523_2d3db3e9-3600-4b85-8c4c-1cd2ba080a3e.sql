-- 1) product_overrides.b2b_price — re-apply column-level revoke
REVOKE SELECT (b2b_price) ON public.product_overrides FROM anon, authenticated;

-- 2) promo_codes — remove public enumeration
DROP POLICY IF EXISTS "Anyone can read active promo codes" ON public.promo_codes;

DROP POLICY IF EXISTS "Admins can read promo codes" ON public.promo_codes;
CREATE POLICY "Admins can read promo codes"
  ON public.promo_codes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT ON public.promo_codes FROM anon;

CREATE OR REPLACE FUNCTION public.validate_promo_code(_code text)
RETURNS TABLE(code text, type public.promo_code_type, value numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pc.code, pc.type, pc.value
  FROM public.promo_codes pc
  WHERE pc.active = true
    AND upper(pc.code) = upper(_code)
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.validate_promo_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_promo_code(text) TO anon, authenticated, service_role;

-- 3) Realtime — restrict channel subscriptions to admins
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can receive realtime messages" ON realtime.messages;
CREATE POLICY "Admins can receive realtime messages"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can send realtime messages" ON realtime.messages;
CREATE POLICY "Admins can send realtime messages"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
