-- =========================================================================
-- 0007 — Endurecimento (Fase 6)
-- =========================================================================
-- 1) Criação de notificações via função SECURITY DEFINER (permite notificar
--    terceiros por fluxos controlados) e RLS de inserção volta ao ESTRITO.
-- 2) Bloqueio de usuários (tabela blocks) + helper are_blocked().
-- =========================================================================

-- --- Notificações: função definer + política estrita -----------------------
create or replace function public.create_notification(
  target uuid,
  ntype notification_type,
  ntitle text,
  nbody text default null,
  nlink text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Só um usuário autenticado pode disparar notificações.
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.notifications (profile_id, type, title, body, link)
  values (target, ntype, ntitle, nbody, nlink);
end;
$$;

grant execute on function public.create_notification(uuid, notification_type, text, text, text) to authenticated;

-- Volta a política de inserção ao estrito (self/admin). A criação para
-- terceiros passa a ser feita exclusivamente pela função acima.
drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications for insert
  with check (is_admin() or profile_id = auth.uid());

-- --- Bloqueio de usuários ---------------------------------------------------
create table if not exists public.blocks (
  id                 uuid primary key default gen_random_uuid(),
  blocker_profile_id uuid not null references public.profiles (id) on delete cascade,
  blocked_profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at         timestamptz not null default now(),
  unique (blocker_profile_id, blocked_profile_id),
  check (blocker_profile_id <> blocked_profile_id)
);
create index if not exists idx_blocks_blocker on public.blocks (blocker_profile_id);

alter table public.blocks enable row level security;

create policy "blocks_select" on public.blocks for select
  using (blocker_profile_id = auth.uid() or is_admin());
create policy "blocks_write" on public.blocks for all
  using (blocker_profile_id = auth.uid())
  with check (blocker_profile_id = auth.uid());

-- Verdadeiro se qualquer um dos dois bloqueou o outro.
create or replace function public.are_blocked(p1 uuid, p2 uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_profile_id = p1 and blocked_profile_id = p2)
       or (blocker_profile_id = p2 and blocked_profile_id = p1)
  );
$$;

grant execute on function public.are_blocked(uuid, uuid) to authenticated;
