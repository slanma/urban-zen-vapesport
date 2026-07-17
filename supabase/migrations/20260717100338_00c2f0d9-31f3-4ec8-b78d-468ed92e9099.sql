ALTER TABLE public.b2b_profiles ADD COLUMN IF NOT EXISTS obrat_2025 numeric;
ALTER TABLE public.b2b_profiles ADD COLUMN IF NOT EXISTS obrat_2026 numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS attachment_url text;