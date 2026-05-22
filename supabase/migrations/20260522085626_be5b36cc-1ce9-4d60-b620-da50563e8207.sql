ALTER TABLE public.product_overrides
  ADD COLUMN IF NOT EXISTS b2b_price integer,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS ai_keywords text;