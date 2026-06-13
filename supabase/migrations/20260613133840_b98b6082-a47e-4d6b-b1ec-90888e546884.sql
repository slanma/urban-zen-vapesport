
ALTER TABLE public.product_overrides
  ADD COLUMN IF NOT EXISTS subtitle_override TEXT,
  ADD COLUMN IF NOT EXISTS ebike_integrated_battery BOOLEAN,
  ADD COLUMN IF NOT EXISTS ebike_full_suspension BOOLEAN,
  ADD COLUMN IF NOT EXISTS motor_type TEXT,
  ADD COLUMN IF NOT EXISTS battery_location TEXT,
  ADD COLUMN IF NOT EXISTS dimensions_l_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS dimensions_h_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS dimensions_w_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS touch_film TEXT,
  ADD COLUMN IF NOT EXISTS material TEXT,
  ADD COLUMN IF NOT EXISTS low_step_compatible BOOLEAN,
  ADD COLUMN IF NOT EXISTS manufacturer TEXT,
  ADD COLUMN IF NOT EXISTS problem_bullet TEXT,
  ADD COLUMN IF NOT EXISTS function_bullet TEXT,
  ADD COLUMN IF NOT EXISTS usage_bullet TEXT,
  ADD COLUMN IF NOT EXISTS color_stock JSONB,
  ADD COLUMN IF NOT EXISTS compatible_bikes TEXT[],
  ADD COLUMN IF NOT EXISTS rag_content TEXT,
  ADD COLUMN IF NOT EXISTS max_frame_circumference_cm NUMERIC;

INSERT INTO public.site_settings (key, value) VALUES
  ('longer_straps_product_id', ''),
  ('longer_straps_price_override', ''),
  ('default_max_frame_circumference_cm', '7.5')
ON CONFLICT (key) DO NOTHING;
