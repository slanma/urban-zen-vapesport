
ALTER TABLE public.product_overrides
  ADD COLUMN IF NOT EXISTS name_override TEXT,
  ADD COLUMN IF NOT EXISTS category_override TEXT,
  ADD COLUMN IF NOT EXISTS short_description_override TEXT,
  ADD COLUMN IF NOT EXISTS features_override JSONB,
  ADD COLUMN IF NOT EXISTS specs_override JSONB,
  ADD COLUMN IF NOT EXISTS colors_override JSONB,
  ADD COLUMN IF NOT EXISTS tech_params_html TEXT;
