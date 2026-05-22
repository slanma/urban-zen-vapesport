
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  order_number TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit withdrawal request"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update withdrawal requests"
  ON public.withdrawal_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete withdrawal requests"
  ON public.withdrawal_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
