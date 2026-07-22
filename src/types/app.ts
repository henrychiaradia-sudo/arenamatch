import type {
  UserRole,
  AccountStatus,
  VerificationStatus,
  PlanTier,
  ProjectStatus,
  OpportunityStatus,
  InvestmentModel,
} from './enums';

/**
 * Tipos de domínio voltados à UI (view models).
 * Independentes dos tipos gerados do banco (src/types/database.ts), que são
 * regenerados via `npm run db:types` quando o schema muda.
 */

export interface Profile {
  id: string;
  role: UserRole;
  fullName: string;
  avatarUrl: string | null;
  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
  planTier: PlanTier;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface SessionContext {
  userId: string;
  email: string;
  profile: Profile;
}

/** Cartão resumido de atleta para listagens/descoberta. */
export interface AthleteCard {
  id: string;
  slug: string;
  fullName: string;
  avatarUrl: string | null;
  sport: string;
  category: string;
  city: string;
  state: string;
  followers: number | null;
  verified: boolean;
  highlighted: boolean;
  investmentNeedCents: number | null;
  matchScore?: number;
}

/** Cartão resumido de projeto. */
export interface ProjectCard {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  sport: string;
  city: string;
  state: string;
  status: ProjectStatus;
  goalCents: number;
  raisedCents: number;
  verified: boolean;
  matchScore?: number;
}

/** Cartão resumido de oportunidade. */
export interface OpportunityCard {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  investmentModel: InvestmentModel;
  minInvestmentCents: number | null;
  maxInvestmentCents: number | null;
  status: OpportunityStatus;
  deadline: string | null;
  matchScore?: number;
}

/** Motivo textual que compõe um score de compatibilidade. */
export interface MatchReason {
  label: string;
  weight: number;
  matched: boolean;
}

/** Resultado do cálculo de compatibilidade. */
export interface MatchResult {
  score: number; // 0-100
  reasons: MatchReason[];
}

/** KPI simples para dashboards. */
export interface StatCard {
  label: string;
  value: string;
  hint?: string;
  trend?: number;
}
