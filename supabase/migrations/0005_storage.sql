-- =========================================================================
-- 0005 — Storage (buckets e políticas)
-- =========================================================================
-- avatars/covers: leitura pública, upload na pasta do próprio usuário.
-- documents/evidence: PRIVADOS. Acesso apenas via URL assinada (dono/admin).
-- Convenção de caminho: "<auth.uid()>/arquivo.ext" (primeira pasta = user id).
-- =========================================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('covers', 'covers', true),
  ('documents', 'documents', false),
  ('evidence', 'evidence', false)
on conflict (id) do nothing;

-- Leitura pública de avatares e capas.
create policy "storage_public_read"
  on storage.objects for select
  using (bucket_id in ('avatars', 'covers'));

-- Leitura privada de documentos/evidências: dono (pasta = user id) ou admin.
create policy "storage_private_read"
  on storage.objects for select
  using (
    bucket_id in ('documents', 'evidence')
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- Upload: usuário autenticado, somente na própria pasta.
create policy "storage_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id in ('avatars', 'covers', 'documents', 'evidence')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Atualizar/remover apenas os próprios arquivos.
create policy "storage_update_own"
  on storage.objects for update
  using ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin());

create policy "storage_delete_own"
  on storage.objects for delete
  using ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin());
