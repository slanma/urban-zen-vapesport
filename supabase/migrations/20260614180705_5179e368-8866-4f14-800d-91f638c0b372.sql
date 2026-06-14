DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR email = (auth.jwt() ->> 'email')
  );