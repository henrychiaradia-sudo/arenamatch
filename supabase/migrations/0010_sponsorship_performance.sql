-- =========================================================================
-- 0010 — Performance do Patrocínio (Fase 1)
-- =========================================================================
-- Parâmetros de cálculo por patrocínio (deal). Tudo o mais é computado a
-- partir do investimento (deals), das contrapartidas (deliverables) e do
-- público do atleta (athlete_profiles). O usuário pode calibrar CPM, custos
-- extras, valor de ativações e sobrescrever o alcance.
-- =========================================================================

create table public.sponsorship_performance (
  deal_id           uuid primary key references public.deals (id) on delete cascade,
  cpm_cents         bigint not null default 2200,  -- CPM em centavos (R$ 22,00)
  extra_cost_cents  bigint not null default 0,     -- ativações extras (custo)
  other_value_cents bigint not null default 0,     -- valor de ativações/eventos além da mídia
  reach_override    bigint,                         -- se preenchido, usa como alcance total
  updated_at        timestamptz not null default now()
);

alter table public.sponsorship_performance enable row level security;

-- Empresa dona do patrocínio (ou admin) pode ver e calibrar.
create policy "sponsorship_performance_all" on public.sponsorship_performance for all
  using (
    exists (select 1 from public.deals d
            where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin()))
  )
  with check (
    exists (select 1 from public.deals d
            where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin()))
  );
