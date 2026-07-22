-- =========================================================================
-- 0001 — Extensões e tipos ENUM
-- =========================================================================
-- ArenaMatch — plataforma de patrocínio esportivo.
-- Mantenha estes enums sincronizados com src/types/enums.ts
-- =========================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()
create extension if not exists citext;   -- e-mails/handles case-insensitive

-- Papéis e contas ---------------------------------------------------------
create type user_role as enum ('athlete', 'company', 'manager', 'admin');
create type account_status as enum ('pending', 'active', 'suspended', 'deleted');
create type company_member_role as enum ('owner', 'admin', 'member');

-- Verificação -------------------------------------------------------------
create type verification_status as enum (
  'not_started', 'documents_pending', 'under_review', 'verified', 'rejected', 'suspended'
);

-- Investimento / financiamento -------------------------------------------
create type investment_model as enum ('direct', 'incentive', 'both');
create type funding_model as enum ('direct', 'incentive', 'mixed');

-- Projetos ----------------------------------------------------------------
create type project_status as enum (
  'draft', 'under_analysis', 'approved', 'fundraising',
  'partially_funded', 'fully_funded', 'in_execution', 'completed', 'suspended'
);

-- Oportunidades -----------------------------------------------------------
create type opportunity_status as enum (
  'draft', 'open', 'under_analysis', 'in_negotiation', 'closed', 'cancelled'
);

-- Candidaturas ------------------------------------------------------------
create type application_status as enum (
  'submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'
);

-- Conexões ----------------------------------------------------------------
create type connection_request_status as enum ('pending', 'accepted', 'declined', 'cancelled');

-- Negociações (CRM) -------------------------------------------------------
create type deal_status as enum (
  'new_contact', 'contacted', 'evaluating', 'meeting_scheduled',
  'proposal_requested', 'proposal_sent', 'negotiating', 'approved',
  'contract_drafting', 'closed_won', 'closed_lost', 'paused'
);

-- Contrapartidas ----------------------------------------------------------
create type deliverable_status as enum (
  'planned', 'in_progress', 'awaiting_approval', 'completed', 'rejected', 'late', 'cancelled'
);

-- Planos ------------------------------------------------------------------
create type plan_tier as enum (
  'athlete_free', 'athlete_premium', 'company_free', 'company_pro', 'company_corporate'
);

-- Notificações ------------------------------------------------------------
create type notification_type as enum (
  'new_interest', 'interest_accepted', 'interest_declined', 'new_message',
  'compatible_opportunity', 'status_changed', 'deliverable_due_soon',
  'deliverable_late', 'profile_verified', 'document_rejected'
);

-- Favoritos / denúncias ---------------------------------------------------
create type favoritable_type as enum ('athlete', 'company', 'project', 'opportunity');
create type report_status as enum ('open', 'under_review', 'resolved', 'dismissed');
