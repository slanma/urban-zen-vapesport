CREATE TABLE public.product_overrides (
  product_id text PRIMARY KEY,
  visible boolean NOT NULL DEFAULT true,
  in_stock boolean NOT NULL DEFAULT true,
  price_override integer,
  vat_percent integer NOT NULL DEFAULT 21,
  description_html text,
  youtube_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product overrides"
  ON public.product_overrides FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert product overrides"
  ON public.product_overrides FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product overrides"
  ON public.product_overrides FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product overrides"
  ON public.product_overrides FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_product_overrides_updated_at
BEFORE UPDATE ON public.product_overrides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();