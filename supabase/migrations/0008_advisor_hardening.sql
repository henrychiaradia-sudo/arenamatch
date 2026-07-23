-- =========================================================================
-- 0008 — Endurecimento a partir dos advisors do Supabase
-- =========================================================================

-- Corrige search_path mutável na função de trigger set_updated_at.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Remove funções trigger-only / server-only da superfície pública de RPC.
-- handle_new_user roda apenas via trigger (não precisa ser chamável por RPC).
revoke execute on function public.handle_new_user() from anon, authenticated;
-- create_notification é chamada só por server actions autenticadas.
revoke execute on function public.create_notification(uuid, notification_type, text, text, text) from anon;
