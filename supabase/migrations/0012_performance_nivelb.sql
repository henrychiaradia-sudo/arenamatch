-- =========================================================================
-- 0012 — Performance (Nível B restante): TV, público, hospitalidade,
--         licenciamento e merchandising. Dados informados pelo cliente.
-- =========================================================================

create table public.tv_exposures (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals (id) on delete cascade,
  program       text not null,
  exposure_type text not null,  -- logo, backdrop, uniforme, placas, led, entrevista
  seconds       integer not null default 0,
  insertions    integer not null default 0,
  audience      bigint not null default 0,
  ave_cents     bigint not null default 0,
  aired_on      date,
  created_at    timestamptz not null default now()
);
create index idx_tv_exposures_deal on public.tv_exposures (deal_id);
alter table public.tv_exposures enable row level security;

create table public.audience_segments (
  id         uuid primary key default gen_random_uuid(),
  deal_id    uuid not null references public.deals (id) on delete cascade,
  dimension  text not null,  -- genero, faixa_etaria, classe, regiao, interesse
  label      text not null,
  pct        numeric(5, 2) not null default 0,
  created_at timestamptz not null default now()
);
create index idx_audience_segments_deal on public.audience_segments (deal_id);
alter table public.audience_segments enable row level security;

create table public.hospitality_events (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals (id) on delete cascade,
  event_name    text not null,
  guests        integer not null default 0,
  clients       integer not null default 0,
  executives    integer not null default 0,
  deals_started integer not null default 0,
  deals_closed  integer not null default 0,
  satisfaction  numeric(3, 1),
  created_at    timestamptz not null default now()
);
create index idx_hospitality_deal on public.hospitality_events (deal_id);
alter table public.hospitality_events enable row level security;

create table public.licensing_records (
  id             uuid primary key default gen_random_uuid(),
  deal_id        uuid not null references public.deals (id) on delete cascade,
  product        text not null,
  region         text,
  units_sold     integer not null default 0,
  revenue_cents  bigint not null default 0,
  royalties_cents bigint not null default 0,
  created_at     timestamptz not null default now()
);
create index idx_licensing_deal on public.licensing_records (deal_id);
alter table public.licensing_records enable row level security;

create table public.merchandising_points (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals (id) on delete cascade,
  pdv_name      text not null,
  region        text,
  material_type text not null,  -- display, ilha, encarte, pdv, banner
  points        integer not null default 0,
  created_at    timestamptz not null default now()
);
create index idx_merch_deal on public.merchandising_points (deal_id);
alter table public.merchandising_points enable row level security;

-- RLS: empresa dona do patrocínio (ou admin), para as cinco.
do $$
declare t text;
begin
  foreach t in array array['tv_exposures','audience_segments','hospitality_events','licensing_records','merchandising_points'] loop
    execute format($f$
      create policy "%1$s_all" on public.%1$I for all
        using (exists (select 1 from public.deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())))
        with check (exists (select 1 from public.deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())));
    $f$, t);
  end loop;
end $$;
