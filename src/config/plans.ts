import type { PlanTier } from '@/types/enums';

/**
 * Definição de planos e ENTITLEMENTS (limites aplicáveis).
 * O pagamento real NÃO está ativo neste MVP — os planos existem como dados e
 * os limites são aplicados no servidor (fonte da verdade) e refletidos no front.
 * `null` em um limite numérico significa "ilimitado".
 */

export type PlanAudience = 'athlete' | 'company';

export interface PlanEntitlements {
  /** Máximo de candidaturas ativas (atleta). */
  maxApplications: number | null;
  /** Máximo de favoritos. */
  maxFavorites: number | null;
  /** Máximo de oportunidades ativas (empresa). */
  maxActiveOpportunities: number | null;
  /** Máximo de novos contatos/conexões iniciados por mês. */
  maxContactsPerMonth: number | null;
  /** Máximo de membros na conta (empresa corporativa). */
  maxTeamMembers: number | null;
  /** Perfil destacado nas buscas. */
  highlightedProfile: boolean;
  /** Acesso a busca avançada / filtros completos. */
  advancedSearch: boolean;
  /** Acesso ao pipeline (CRM) de negociações. */
  pipeline: boolean;
  /** Score de match avançado com detalhamento. */
  advancedMatch: boolean;
  /** Estatísticas do próprio perfil (visualizações etc.). */
  profileAnalytics: boolean;
  /** Relatórios exportáveis. */
  reports: boolean;
  /** Gestão de contrapartidas. */
  deliverablesManagement: boolean;
}

export interface PlanDefinition {
  tier: PlanTier;
  audience: PlanAudience;
  name: string;
  description: string;
  /** Preço em centavos (0 = gratuito). Não cobrado neste MVP. */
  priceCents: number;
  highlighted: boolean;
  features: string[];
  entitlements: PlanEntitlements;
}

const UNLIMITED = null;

export const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  athlete_free: {
    tier: 'athlete_free',
    audience: 'athlete',
    name: 'Atleta Gratuito',
    description: 'Comece a ser descoberto por marcas e projetos.',
    priceCents: 0,
    highlighted: false,
    features: [
      'Perfil profissional básico',
      'Até 5 candidaturas ativas',
      'Até 10 favoritos',
      'Acesso às oportunidades abertas',
    ],
    entitlements: {
      maxApplications: 5,
      maxFavorites: 10,
      maxActiveOpportunities: 0,
      maxContactsPerMonth: 5,
      maxTeamMembers: 1,
      highlightedProfile: false,
      advancedSearch: false,
      pipeline: false,
      advancedMatch: false,
      profileAnalytics: false,
      reports: false,
      deliverablesManagement: true,
    },
  },
  athlete_premium: {
    tier: 'athlete_premium',
    audience: 'athlete',
    name: 'Atleta Premium',
    description: 'Mais exposição, estatísticas e destaque nas buscas.',
    priceCents: 2990,
    highlighted: true,
    features: [
      'Perfil destacado nas buscas',
      'Candidaturas ilimitadas',
      'Estatísticas do perfil',
      'Selo visual Premium',
      'Maior exposição na descoberta',
    ],
    entitlements: {
      maxApplications: UNLIMITED,
      maxFavorites: UNLIMITED,
      maxActiveOpportunities: 0,
      maxContactsPerMonth: UNLIMITED,
      maxTeamMembers: 1,
      highlightedProfile: true,
      advancedSearch: true,
      pipeline: false,
      advancedMatch: true,
      profileAnalytics: true,
      reports: false,
      deliverablesManagement: true,
    },
  },
  company_free: {
    tier: 'company_free',
    audience: 'company',
    name: 'Empresa Gratuita',
    description: 'Explore atletas e projetos e publique sua primeira oportunidade.',
    priceCents: 0,
    highlighted: false,
    features: [
      'Perfil institucional',
      'Busca limitada',
      'Até 10 contatos por mês',
      '1 oportunidade ativa',
    ],
    entitlements: {
      maxApplications: 0,
      maxFavorites: 20,
      maxActiveOpportunities: 1,
      maxContactsPerMonth: 10,
      maxTeamMembers: 1,
      highlightedProfile: false,
      advancedSearch: false,
      pipeline: false,
      advancedMatch: false,
      profileAnalytics: false,
      reports: false,
      deliverablesManagement: false,
    },
  },
  company_pro: {
    tier: 'company_pro',
    audience: 'company',
    name: 'Empresa Profissional',
    description: 'Busca avançada, pipeline e gestão completa de patrocínios.',
    priceCents: 49900,
    highlighted: true,
    features: [
      'Busca avançada e filtros completos',
      'Contatos ampliados',
      'Oportunidades ilimitadas',
      'Pipeline de negociações (CRM)',
      'Match avançado',
      'Relatórios',
      'Gestão de contrapartidas',
    ],
    entitlements: {
      maxApplications: 0,
      maxFavorites: UNLIMITED,
      maxActiveOpportunities: UNLIMITED,
      maxContactsPerMonth: UNLIMITED,
      maxTeamMembers: 3,
      highlightedProfile: true,
      advancedSearch: true,
      pipeline: true,
      advancedMatch: true,
      profileAnalytics: true,
      reports: true,
      deliverablesManagement: true,
    },
  },
  company_corporate: {
    tier: 'company_corporate',
    audience: 'company',
    name: 'Empresa Corporativa',
    description: 'Múltiplos usuários, permissões e gestão de portfólio.',
    priceCents: 149900,
    highlighted: false,
    features: [
      'Múltiplos usuários e permissões',
      'Dashboard avançado',
      'Relatórios personalizados',
      'Gestão de portfólio',
      'Suporte prioritário',
    ],
    entitlements: {
      maxApplications: 0,
      maxFavorites: UNLIMITED,
      maxActiveOpportunities: UNLIMITED,
      maxContactsPerMonth: UNLIMITED,
      maxTeamMembers: 25,
      highlightedProfile: true,
      advancedSearch: true,
      pipeline: true,
      advancedMatch: true,
      profileAnalytics: true,
      reports: true,
      deliverablesManagement: true,
    },
  },
};

/** Retorna os entitlements de um plano. */
export function getEntitlements(tier: PlanTier): PlanEntitlements {
  return PLAN_DEFINITIONS[tier].entitlements;
}

/** Verifica se um limite numérico foi atingido. `null` = ilimitado. */
export function hasReachedLimit(limit: number | null, currentCount: number): boolean {
  if (limit === null) return false;
  return currentCount >= limit;
}

export const ATHLETE_PLANS = [PLAN_DEFINITIONS.athlete_free, PLAN_DEFINITIONS.athlete_premium];
export const COMPANY_PLANS = [
  PLAN_DEFINITIONS.company_free,
  PLAN_DEFINITIONS.company_pro,
  PLAN_DEFINITIONS.company_corporate,
];
