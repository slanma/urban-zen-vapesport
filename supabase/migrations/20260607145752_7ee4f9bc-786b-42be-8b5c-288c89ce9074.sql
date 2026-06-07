
-- Order status enum
CREATE TYPE public.order_status AS ENUM ('nova', 'zpracovava_se', 'odeslano', 'dorucena', 'zrusena');

-- Orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_b2b boolean NOT NULL DEFAULT false,

  -- customer
  email text NOT NULL,
  phone text,
  first_name text,
  last_name text,

  -- shipping address
  street text,
  city text,
  zip text,

  -- b2b billing
  company_name text,
  ico text,
  dic text,

  -- order content
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal_gross integer NOT NULL DEFAULT 0,
  shipping_label text,
  shipping_gross integer NOT NULL DEFAULT 0,
  payment_label text,
  payment_gross integer NOT NULL DEFAULT 0,
  total_gross integer NOT NULL DEFAULT 0,

  packeta_point text,
  note text,
  status public.order_status NOT NULL DEFAULT 'nova',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX orders_status_idx ON public.orders (status);
CREATE INDEX orders_email_idx ON public.orders (email);
CREATE INDEX orders_user_id_idx ON public.orders (user_id);

-- Grants (anon may INSERT through checkout; SELECT is locked down by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. guests) can create an order from checkout
CREATE POLICY "Anyone can create order"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can read their own orders (by user_id or by email if logged in with same email)
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can read all
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all
CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Updated-at trigger
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.b2b_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.withdrawal_requests REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.b2b_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawal_requests;
