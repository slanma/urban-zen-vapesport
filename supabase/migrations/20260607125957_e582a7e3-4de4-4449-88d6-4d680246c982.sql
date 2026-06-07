-- Enforce column-level protection on product_overrides.b2b_price.
-- RLS cannot express column filters, so we lock b2b_price down via column
-- privileges and require anon/authenticated clients to fetch wholesale
-- pricing exclusively through the get_product_b2b_prices() SECURITY DEFINER
-- RPC, which gates rows by admin/approved-B2B role.

-- Revoke any blanket table-level SELECT first so we can re-grant per-column.
REVOKE SELECT ON public.product_overrides FROM anon, authenticated;

-- Grant SELECT only on the non-sensitive columns. b2b_price is intentionally
-- excluded for both anon and authenticated.
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

-- Admin write paths (INSERT/UPDATE/DELETE) are unchanged — RLS still gates
-- them to admins, and the original table-level grants remain for those verbs.
GRANT INSERT, UPDATE, DELETE ON public.product_overrides TO authenticated;

-- Service role keeps full access for edge functions and the B2B RPC.
GRANT ALL ON public.product_overrides TO service_role;