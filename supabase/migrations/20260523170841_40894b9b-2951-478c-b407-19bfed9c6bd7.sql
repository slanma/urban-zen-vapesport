insert into storage.buckets (id, name, public) values ('product-content', 'product-content', true) on conflict (id) do nothing;

create policy "Admins can upload product content" on storage.objects for insert to authenticated with check (bucket_id = 'product-content' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can update product content" on storage.objects for update to authenticated using (bucket_id = 'product-content' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete product content" on storage.objects for delete to authenticated using (bucket_id = 'product-content' and public.has_role(auth.uid(), 'admin'));
create policy "Public can read product content" on storage.objects for select to public using (bucket_id = 'product-content');