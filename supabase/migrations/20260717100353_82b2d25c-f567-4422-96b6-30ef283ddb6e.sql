ALTER TABLE public.b2b_profiles
  ADD COLUMN IF NOT EXISTS invoice_email text,
  ADD COLUMN IF NOT EXISTS delivery_same boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS delivery_company text,
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS delivery_city text,
  ADD COLUMN IF NOT EXISTS delivery_zip text,
  ADD COLUMN IF NOT EXISTS delivery_contact text,
  ADD COLUMN IF NOT EXISTS delivery_phone text;