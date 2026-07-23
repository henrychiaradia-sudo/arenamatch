-- =========================================================================
-- 0011 — Performance do Patrocínio (Fase 2): entrada de dados (Nível B)
-- =========================================================================
-- Mídia espontânea (clipping), pesquisa de marca (brand lift) e leads.
-- Dados informados/importados pelo cliente; a plataforma consolida e visualiza.
-- =========================================================================

-- --- Mídia espontânea (clipping) -------------------------------------------
create table public.media_clippings (
  id           uuid primary key default gen_random_uuid(),
  deal_id      uuid not null references public.deals (id) on delete cascade,
  outlet_type  text not null,   -- tv, jornal, revista, portal, blog, podcast, radio, influenciador
  outlet_name  text not null,
  title        text,
  url          text,
  reach        bigint not null default 0,       -- audiência/alcance
  ave_cents    bigint not null default 0,       -- valor equivalente de mídia (AVE)
  sentiment    text not null default 'neutral' check (sentiment in ('positive', 'neutral', 'negative')),
  published_at date,
  created_at   timestamptz not null default now()
);
create index idx_media_clippings_deal on public.media_clippings (deal_id);
alter table public.media_clippings enable row level security;

-- --- Pesquisa de marca (brand lift, antes x depois) ------------------------
create table public.brand_surveys (
  id           uuid primary key default gen_random_uuid(),
  deal_id      uuid not null references public.deals (id) on delete cascade,
  metric       text not null,   -- recall_espontaneo, top_of_mind, intencao_compra, nps, favorabilidade...
  before_value numeric(10, 2) not null default 0,
  after_value  numeric(10, 2) not null default 0,
  unit         text not null default '%',
  sample_size  integer,
  measured_at  date,
  created_at   timestamptz not null default now()
);
create index idx_brand_surveys_deal on public.brand_surveys (deal_id);
alter table public.brand_surveys enable row level security;

-- --- Leads -----------------------------------------------------------------
create table public.sponsorship_leads (
  id         uuid primary key default gen_random_uuid(),
  deal_id    uuid not null references public.deals (id) on delete cascade,
  source     text not null,     -- landing_page, qr_code, cupom, cadastro, download
  captured   integer not null default 0,
  converted  integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_sponsorship_leads_deal on public.sponsorship_leads (deal_id);
alter table public.sponsorship_leads enable row level security;

-- --- RLS: empresa dona do patrocínio (ou admin) ----------------------------
create policy "media_clippings_all" on public.media_clippings for all
  using (exists (select 1 from public.deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())))
  with check (exists (select 1 from public.deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())));

create policy "brand_surveys_all" on public.brand_surveys for all
  using (exists (select 1 from public.deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())))
  with check (exists (select 1 from public.deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())));

create policy "sponsorship_leads_all" on public.sponsorship_leads for all
  using (exists (select 1 from public.deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())))
  with check (exists (select 1 from public.deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())));
