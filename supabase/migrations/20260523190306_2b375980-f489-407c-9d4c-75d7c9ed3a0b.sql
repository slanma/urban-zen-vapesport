-- Hide b2b_price from anon/authenticated by revoking table-level SELECT
-- and granting SELECT only on non-sensitive columns. Admin and B2B-partner
-- access to b2b_price continues to flow through the SECURITY DEFINER RPC
-- public.get_product_b2b_prices().

REVOKE SELECT ON public.product_overrides FROM anon, authenticated;

GRANT SELECT (
  product_id,
  visible,
  in_stock,
  price_override,
  vat_percent,
  description_html,
  youtube_url,
  meta_title,
  meta_description,
  ai_keywords,
  name_override,
  category_override,
  short_description_override,
  features_override,
  specs_override,
  colors_override,
  tech_params_html,
  created_at,
  updated_at
) ON public.product_overrides TO anon, authenticated;

-- Admins still need full SELECT (including b2b_price) for the admin panel,
-- but admin reads also go through the RPC; service_role retains full access.
GRANT SELECT ON public.product_overrides TO service_role;