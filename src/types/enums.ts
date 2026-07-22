/**
 * Enums do domínio (espelham os tipos ENUM do PostgreSQL).
 * Cada enum acompanha um mapa de rótulos em PT-BR para uso na UI.
 * Mantenha este arquivo sincronizado com supabase/migrations/0001_extensions_and_enums.sql
 */

// --- Papéis e contas -------------------------------------------------------
export const USER_ROLES = ['athlete', 'company', 'manager', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const userRoleLabels: Record<UserRole, string> = {
  athlete: 'Atleta',
  company: 'Empresa',
  manager: 'Gestor de projeto',
  admin: 'Administrador',
};

/** Papéis que podem ser escolhidos no cadastro público (admin é interno). */
export const SIGNUP_ROLES = ['athlete', 'company', 'manager'] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];

export const ACCOUNT_STATUSES = ['pending', 'active', 'suspended', 'deleted'] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const accountStatusLabels: Record<AccountStatus, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  suspended: 'Suspenso',
  deleted: 'Excluído',
};

// --- Verificação -----------------------------------------------------------
export const VERIFICATION_STATUSES = [
  'not_started',
  'documents_pending',
  'under_review',
  'verified',
  'rejected',
  'suspended',
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  not_started: 'Não iniciado',
  documents_pending: 'Documentação pendente',
  under_review: 'Em análise',
  verified: 'Verificado',
  rejected: 'Rejeitado',
  suspended: 'Suspenso',
};

// --- Modelos de investimento / financiamento -------------------------------
export const INVESTMENT_MODELS = ['direct', 'incentive', 'both'] as const;
export type InvestmentModel = (typeof INVESTMENT_MODELS)[number];

export const investmentModelLabels: Record<InvestmentModel, string> = {
  direct: 'Patrocínio direto',
  incentive: 'Patrocínio incentivado',
  both: 'Direto ou incentivado',
};

export const FUNDING_MODELS = ['direct', 'incentive', 'mixed'] as const;
export type FundingModel = (typeof FUNDING_MODELS)[number];

export const fundingModelLabels: Record<FundingModel, string> = {
  direct: 'Recursos diretos',
  incentive: 'Lei de incentivo',
  mixed: 'Misto',
};

// --- Projetos --------------------------------------------------------------
export const PROJECT_STATUSES = [
  'draft',
  'under_analysis',
  'approved',
  'fundraising',
  'partially_funded',
  'fully_funded',
  'in_execution',
  'completed',
  'suspended',
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const projectStatusLabels: Record<ProjectStatus, string> = {
  draft: 'Em elaboração',
  under_analysis: 'Em análise',
  approved: 'Aprovado',
  fundraising: 'Em captação',
  partially_funded: 'Parcialmente captado',
  fully_funded: 'Totalmente captado',
  in_execution: 'Em execução',
  completed: 'Concluído',
  suspended: 'Suspenso',
};

// --- Oportunidades ---------------------------------------------------------
export const OPPORTUNITY_STATUSES = [
  'draft',
  'open',
  'under_analysis',
  'in_negotiation',
  'closed',
  'cancelled',
] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const opportunityStatusLabels: Record<OpportunityStatus, string> = {
  draft: 'Rascunho',
  open: 'Aberta',
  under_analysis: 'Em análise',
  in_negotiation: 'Em negociação',
  closed: 'Encerrada',
  cancelled: 'Cancelada',
};

// --- Candidaturas ----------------------------------------------------------
export const APPLICATION_STATUSES = [
  'submitted',
  'under_review',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  submitted: 'Enviada',
  under_review: 'Em análise',
  shortlisted: 'Pré-selecionada',
  accepted: 'Aceita',
  rejected: 'Recusada',
  withdrawn: 'Retirada',
};

// --- Conexões --------------------------------------------------------------
export const CONNECTION_REQUEST_STATUSES = [
  'pending',
  'accepted',
  'declined',
  'cancelled',
] as const;
export type ConnectionRequestStatus = (typeof CONNECTION_REQUEST_STATUSES)[number];

export const connectionRequestStatusLabels: Record<ConnectionRequestStatus, string> = {
  pending: 'Pendente',
  accepted: 'Aceita',
  declined: 'Recusada',
  cancelled: 'Cancelada',
};

// --- Negociações (pipeline / CRM) -----------------------------------------
export const DEAL_STATUSES = [
  'new_contact',
  'contacted',
  'evaluating',
  'meeting_scheduled',
  'proposal_requested',
  'proposal_sent',
  'negotiating',
  'approved',
  'contract_drafting',
  'closed_won',
  'closed_lost',
  'paused',
] as const;
export type DealStatus = (typeof DEAL_STATUSES)[number];

export const dealStatusLabels: Record<DealStatus, string> = {
  new_contact: 'Novo contato',
  contacted: 'Contato realizado',
  evaluating: 'Em avaliação',
  meeting_scheduled: 'Reunião agendada',
  proposal_requested: 'Proposta solicitada',
  proposal_sent: 'Proposta enviada',
  negotiating: 'Em negociação',
  approved: 'Aprovado',
  contract_drafting: 'Contrato em elaboração',
  closed_won: 'Fechado',
  closed_lost: 'Perdido',
  paused: 'Pausado',
};

/** Colunas do Kanban de negociações, na ordem de exibição. */
export const DEAL_PIPELINE_COLUMNS: DealStatus[] = [
  'new_contact',
  'contacted',
  'evaluating',
  'meeting_scheduled',
  'proposal_requested',
  'proposal_sent',
  'negotiating',
  'approved',
  'contract_drafting',
  'closed_won',
  'closed_lost',
  'paused',
];

// --- Contrapartidas / entregáveis -----------------------------------------
export const DELIVERABLE_STATUSES = [
  'planned',
  'in_progress',
  'awaiting_approval',
  'completed',
  'rejected',
  'late',
  'cancelled',
] as const;
export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number];

export const deliverableStatusLabels: Record<DeliverableStatus, string> = {
  planned: 'Planejada',
  in_progress: 'Em andamento',
  awaiting_approval: 'Aguardando aprovação',
  completed: 'Concluída',
  rejected: 'Rejeitada',
  late: 'Atrasada',
  cancelled: 'Cancelada',
};

// --- Planos ----------------------------------------------------------------
export const PLAN_TIERS = [
  'athlete_free',
  'athlete_premium',
  'company_free',
  'company_pro',
  'company_corporate',
] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const planTierLabels: Record<PlanTier, string> = {
  athlete_free: 'Atleta Gratuito',
  athlete_premium: 'Atleta Premium',
  company_free: 'Empresa Gratuita',
  company_pro: 'Empresa Profissional',
  company_corporate: 'Empresa Corporativa',
};

// --- Notificações ----------------------------------------------------------
export const NOTIFICATION_TYPES = [
  'new_interest',
  'interest_accepted',
  'interest_declined',
  'new_message',
  'compatible_opportunity',
  'status_changed',
  'deliverable_due_soon',
  'deliverable_late',
  'profile_verified',
  'document_rejected',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const notificationTypeLabels: Record<NotificationType, string> = {
  new_interest: 'Novo interesse',
  interest_accepted: 'Interesse aceito',
  interest_declined: 'Interesse recusado',
  new_message: 'Nova mensagem',
  compatible_opportunity: 'Nova oportunidade compatível',
  status_changed: 'Alteração de status',
  deliverable_due_soon: 'Contrapartida próxima do prazo',
  deliverable_late: 'Contrapartida atrasada',
  profile_verified: 'Perfil verificado',
  document_rejected: 'Documento rejeitado',
};

// --- Tipos de entidade favoritável / conectável ---------------------------
export const FAVORITABLE_TYPES = ['athlete', 'company', 'project', 'opportunity'] as const;
export type FavoritableType = (typeof FAVORITABLE_TYPES)[number];

// --- Denúncias -------------------------------------------------------------
export const REPORT_STATUSES = ['open', 'under_review', 'resolved', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const reportStatusLabels: Record<ReportStatus, string> = {
  open: 'Aberta',
  under_review: 'Em análise',
  resolved: 'Resolvida',
  dismissed: 'Descartada',
};
