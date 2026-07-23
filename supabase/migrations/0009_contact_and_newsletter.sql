-- =========================================================================
-- 0009 — Contato e Newsletter (formulários públicos da home)
-- =========================================================================

-- Mensagens de contato (formulário público "Fale conosco")
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
-- Qualquer visitante pode enviar; só admin lê e gerencia.
create policy "contact_insert_public" on public.contact_messages for insert with check (true);
create policy "contact_select_admin" on public.contact_messages for select using (is_admin());
create policy "contact_update_admin" on public.contact_messages for update using (is_admin()) with check (is_admin());
create index idx_contact_messages_created on public.contact_messages (created_at desc);

-- Assinantes da newsletter
create table public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      citext not null unique,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
create policy "newsletter_insert_public" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter_select_admin" on public.newsletter_subscribers for select using (is_admin());
create index idx_newsletter_created on public.newsletter_subscribers (created_at desc);
