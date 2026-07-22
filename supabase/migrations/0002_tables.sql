-- =========================================================================
-- 0002 — Tabelas
-- =========================================================================
-- Convenções: PKs em UUID; created_at/updated_at em todas as tabelas mutáveis;
-- deleted_at (soft delete) onde faz sentido; FKs com ON DELETE apropriado.
-- Valores monetários em CENTAVOS (bigint).
-- =========================================================================

-- ========================= IDENTIDADE ====================================

-- Perfil base (1:1 com auth.users). Criado por trigger no signup.
create table profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  role                user_role not null,
  full_name           text,
  avatar_url          text,
  headline            text,
  account_status      account_status not null default 'active',
  verification_status verification_status not null default 'not_started',
  plan_tier           plan_tier not null default 'athlete_free',
  onboarding_completed boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table profiles is 'Perfil base de todo usuário (1:1 com auth.users).';

-- ========================= CATÁLOGO ======================================

create table sports (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  is_paralympic boolean not null default false,
  created_at    timestamptz not null default now()
);

create table sport_categories (
  id       uuid primary key default gen_random_uuid(),
  sport_id uuid references sports (id) on delete cascade,
  slug     text not null,
  name     text not null,
  unique (sport_id, slug)
);

create table benefits (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text
);
comment on table benefits is 'Catálogo de tipos de contrapartida.';

-- ========================= PERFIS POR PAPEL ==============================

create table athlete_profiles (
  id                    uuid primary key default gen_random_uuid(),
  profile_id            uuid not null unique references profiles (id) on delete cascade,
  slug                  text unique,
  sport_id              uuid references sports (id) on delete set null,
  category              text,
  birth_date            date,
  gender                text,
  city                  text,
  state                 text,
  bio                   text,
  story                 text,
  team                  text,
  federation            text,
  ranking               text,
  cover_url             text,
  followers_total       integer,
  engagement_rate       numeric(5, 2),
  estimated_reach       integer,
  investment_need_cents bigint,
  fundraising_goal      text,
  accepts_direct        boolean not null default true,
  accepts_incentive     boolean not null default false,
  available_for_campaigns boolean not null default true,
  is_paralympic         boolean not null default false,
  audience_tags         text[] not null default '{}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);
create index idx_athlete_profiles_sport on athlete_profiles (sport_id);
create index idx_athlete_profiles_state on athlete_profiles (state);

create table company_profiles (
  id                    uuid primary key default gen_random_uuid(),
  profile_id            uuid not null unique references profiles (id) on delete cascade,
  slug                  text unique,
  legal_name            text,
  public_name           text,
  segment               text,
  size                  text,
  city                  text,
  state                 text,
  description           text,
  website               text,
  logo_url              text,
  cover_url             text,
  investment_model      investment_model not null default 'both',
  min_investment_cents  bigint,
  max_investment_cents  bigint,
  objectives            text[] not null default '{}',
  priority_states       text[] not null default '{}',
  sports_interest       text[] not null default '{}',
  audience_tags         text[] not null default '{}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);
create index idx_company_profiles_state on company_profiles (state);

create table manager_profiles (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null unique references profiles (id) on delete cascade,
  slug            text unique,
  is_organization boolean not null default false,
  org_name        text,
  experience      text,
  areas           text[] not null default '{}',
  document_id     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- Membros de uma empresa (multiusuário — preparado para plano corporativo).
create table company_members (
  id                 uuid primary key default gen_random_uuid(),
  company_profile_id uuid not null references company_profiles (id) on delete cascade,
  profile_id         uuid not null references profiles (id) on delete cascade,
  role               company_member_role not null default 'member',
  created_at         timestamptz not null default now(),
  unique (company_profile_id, profile_id)
);

-- ========================= DOMÍNIO DO ATLETA =============================

create table achievements (
  id                uuid primary key default gen_random_uuid(),
  athlete_profile_id uuid not null references athlete_profiles (id) on delete cascade,
  title             text not null,
  description       text,
  year              integer,
  position          text,
  created_at        timestamptz not null default now()
);
create index idx_achievements_athlete on achievements (athlete_profile_id);

create table competitions (
  id                uuid primary key default gen_random_uuid(),
  athlete_profile_id uuid not null references athlete_profiles (id) on delete cascade,
  name              text not null,
  location          text,
  starts_on         date,
  ends_on           date,
  created_at        timestamptz not null default now()
);
create index idx_competitions_athlete on competitions (athlete_profile_id);

create table social_accounts (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  platform   text not null,
  handle     text,
  url        text,
  followers  integer,
  created_at timestamptz not null default now(),
  unique (profile_id, platform)
);

create table sponsorship_needs (
  id                uuid primary key default gen_random_uuid(),
  athlete_profile_id uuid not null references athlete_profiles (id) on delete cascade,
  title             text not null,
  description       text,
  amount_cents      bigint,
  priority          integer not null default 0,
  created_at        timestamptz not null default now()
);

create table athlete_benefits (
  id                uuid primary key default gen_random_uuid(),
  athlete_profile_id uuid not null references athlete_profiles (id) on delete cascade,
  benefit_id        uuid not null references benefits (id) on delete cascade,
  notes             text,
  unique (athlete_profile_id, benefit_id)
);

-- ========================= PROJETOS ======================================

create table projects (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique,
  title               text not null,
  description         text,
  proponent_name      text,
  manager_profile_id  uuid references manager_profiles (id) on delete set null,
  sport_id            uuid references sports (id) on delete set null,
  category            text,
  state               text,
  city                text,
  scope               text,
  beneficiaries       text,
  objectives          text,
  timeline            text,
  total_cents         bigint not null default 0,
  raised_cents        bigint not null default 0,
  funding_model       funding_model not null default 'incentive',
  status              project_status not null default 'draft',
  process_number      text,
  deadline            date,
  has_social_impact   boolean not null default true,
  cover_url           text,
  verification_status verification_status not null default 'not_started',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);
create index idx_projects_sport on projects (sport_id);
create index idx_projects_state on projects (state);
create index idx_projects_status on projects (status);
create index idx_projects_manager on projects (manager_profile_id);

create table project_athletes (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references projects (id) on delete cascade,
  athlete_profile_id uuid not null references athlete_profiles (id) on delete cascade,
  role              text,
  unique (project_id, athlete_profile_id)
);

create table project_documents (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects (id) on delete cascade,
  type        text not null,
  file_path   text not null,
  status      verification_status not null default 'documents_pending',
  uploaded_by uuid references profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table project_funding (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references projects (id) on delete cascade,
  company_profile_id uuid references company_profiles (id) on delete set null,
  amount_cents       bigint not null,
  note               text,
  created_at         timestamptz not null default now()
);
create index idx_project_funding_project on project_funding (project_id);

-- ========================= OPORTUNIDADES =================================

create table opportunities (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique,
  company_profile_id    uuid not null references company_profiles (id) on delete cascade,
  title                 text not null,
  description           text,
  campaign_goal         text,
  desired_athlete_profile text,
  region_states         text[] not null default '{}',
  investment_model      investment_model not null default 'both',
  min_investment_cents  bigint,
  max_investment_cents  bigint,
  resource_type         text,
  duration              text,
  desired_benefits      text[] not null default '{}',
  deadline              date,
  estimated_slots       integer,
  requirements          text,
  criteria              text,
  status                opportunity_status not null default 'draft',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);
create index idx_opportunities_company on opportunities (company_profile_id);
create index idx_opportunities_status on opportunities (status);

create table opportunity_sports (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  sport_id       uuid not null references sports (id) on delete cascade,
  unique (opportunity_id, sport_id)
);

create table applications (
  id                  uuid primary key default gen_random_uuid(),
  opportunity_id      uuid not null references opportunities (id) on delete cascade,
  applicant_profile_id uuid not null references profiles (id) on delete cascade,
  athlete_profile_id  uuid references athlete_profiles (id) on delete set null,
  project_id          uuid references projects (id) on delete set null,
  message             text,
  status              application_status not null default 'submitted',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (opportunity_id, applicant_profile_id)
);
create index idx_applications_opportunity on applications (opportunity_id);
create index idx_applications_applicant on applications (applicant_profile_id);

-- ========================= ENGAJAMENTO ===================================

create table favorites (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles (id) on delete cascade,
  target_type favoritable_type not null,
  target_id   uuid not null,
  created_at  timestamptz not null default now(),
  unique (profile_id, target_type, target_id)
);
create index idx_favorites_profile on favorites (profile_id);

create table connection_requests (
  id                  uuid primary key default gen_random_uuid(),
  requester_profile_id uuid not null references profiles (id) on delete cascade,
  target_profile_id   uuid not null references profiles (id) on delete cascade,
  context_type        text,
  context_id          uuid,
  message             text,
  status              connection_request_status not null default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (requester_profile_id <> target_profile_id)
);
create index idx_conn_requests_target on connection_requests (target_profile_id);
create index idx_conn_requests_requester on connection_requests (requester_profile_id);

create table connections (
  id         uuid primary key default gen_random_uuid(),
  profile_a  uuid not null references profiles (id) on delete cascade,
  profile_b  uuid not null references profiles (id) on delete cascade,
  request_id uuid references connection_requests (id) on delete set null,
  created_at timestamptz not null default now(),
  check (profile_a < profile_b),
  unique (profile_a, profile_b)
);

create table conversations (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table conversation_members (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  profile_id      uuid not null references profiles (id) on delete cascade,
  last_read_at    timestamptz,
  unique (conversation_id, profile_id)
);
create index idx_conv_members_profile on conversation_members (profile_id);

create table messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references conversations (id) on delete cascade,
  sender_profile_id uuid not null references profiles (id) on delete cascade,
  body              text not null,
  read_at           timestamptz,
  created_at        timestamptz not null default now()
);
create index idx_messages_conversation on messages (conversation_id, created_at);

-- ========================= NEGOCIAÇÕES (CRM) =============================

create table deals (
  id                   uuid primary key default gen_random_uuid(),
  company_profile_id   uuid not null references company_profiles (id) on delete cascade,
  counterpart_profile_id uuid references profiles (id) on delete set null,
  athlete_profile_id   uuid references athlete_profiles (id) on delete set null,
  project_id           uuid references projects (id) on delete set null,
  opportunity_id       uuid references opportunities (id) on delete set null,
  title                text not null,
  status               deal_status not null default 'new_contact',
  estimated_value_cents bigint,
  next_step            text,
  next_contact_on      date,
  owner_profile_id     uuid references profiles (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index idx_deals_company on deals (company_profile_id);
create index idx_deals_status on deals (status);

create table deal_notes (
  id               uuid primary key default gen_random_uuid(),
  deal_id          uuid not null references deals (id) on delete cascade,
  author_profile_id uuid references profiles (id) on delete set null,
  body             text not null,
  created_at       timestamptz not null default now()
);

create table deal_documents (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references deals (id) on delete cascade,
  title       text,
  file_path   text not null,
  uploaded_by uuid references profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table deliverables (
  id                    uuid primary key default gen_random_uuid(),
  deal_id               uuid not null references deals (id) on delete cascade,
  title                 text not null,
  description           text,
  responsible_profile_id uuid references profiles (id) on delete set null,
  due_date              date,
  done_date             date,
  status                deliverable_status not null default 'planned',
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index idx_deliverables_deal on deliverables (deal_id);

create table deliverable_evidence (
  id             uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references deliverables (id) on delete cascade,
  file_path      text,
  url            text,
  note           text,
  created_at     timestamptz not null default now()
);

-- ========================= PLATAFORMA ====================================

create table plans (
  id         uuid primary key default gen_random_uuid(),
  tier       plan_tier not null unique,
  name       text not null,
  audience   text not null,
  price_cents bigint not null default 0,
  is_active  boolean not null default true,
  features   jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table permissions (
  id        uuid primary key default gen_random_uuid(),
  plan_tier plan_tier not null,
  key       text not null,
  value     jsonb not null,
  unique (plan_tier, key)
);
comment on table permissions is 'Entitlements por plano (limites e flags).';

create table subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid not null references profiles (id) on delete cascade,
  plan_tier          plan_tier not null,
  status             text not null default 'active',
  started_at         timestamptz not null default now(),
  current_period_end timestamptz,
  created_at         timestamptz not null default now()
);
create index idx_subscriptions_profile on subscriptions (profile_id);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  type       notification_type not null,
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_profile on notifications (profile_id, created_at desc);

create table verification_requests (
  id           uuid primary key default gen_random_uuid(),
  subject_type text not null, -- athlete | company | project
  subject_id   uuid not null,
  profile_id   uuid not null references profiles (id) on delete cascade,
  status       verification_status not null default 'documents_pending',
  reviewed_by  uuid references profiles (id) on delete set null,
  reviewed_at  timestamptz,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table verification_documents (
  id                      uuid primary key default gen_random_uuid(),
  verification_request_id uuid not null references verification_requests (id) on delete cascade,
  type                    text not null,
  file_path               text not null,
  status                  verification_status not null default 'documents_pending',
  created_at              timestamptz not null default now()
);

create table reports (
  id                 uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references profiles (id) on delete cascade,
  target_type        text not null,
  target_id          uuid not null,
  reason             text not null,
  description        text,
  status             report_status not null default 'open',
  resolved_by        uuid references profiles (id) on delete set null,
  resolved_at        timestamptz,
  created_at         timestamptz not null default now()
);

create table audit_logs (
  id               uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references profiles (id) on delete set null,
  action           text not null,
  entity_type      text,
  entity_id        uuid,
  metadata         jsonb not null default '{}',
  created_at       timestamptz not null default now()
);
create index idx_audit_logs_created on audit_logs (created_at desc);

create table terms_versions (
  id           uuid primary key default gen_random_uuid(),
  version      text not null,
  kind         text not null, -- terms | privacy
  content      text,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  unique (version, kind)
);

create table terms_acceptances (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references profiles (id) on delete cascade,
  terms_version_id uuid not null references terms_versions (id) on delete cascade,
  accepted_at      timestamptz not null default now(),
  ip               text,
  unique (profile_id, terms_version_id)
);
