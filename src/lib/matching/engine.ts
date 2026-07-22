import type { InvestmentModel, FundingModel } from '@/types/enums';
import type { MatchReason, MatchResult } from '@/types/app';

/**
 * MOTOR DE COMPATIBILIDADE (v1 — baseado em regras)
 * =================================================================
 * Calcula um score de 0 a 100 a partir de critérios ponderados. NÃO usa IA.
 * A arquitetura permite substituir/estender por um modelo de ML no futuro
 * (ver docs/ROADMAP.md), mantendo a mesma assinatura de retorno (MatchResult).
 *
 * FÓRMULA:
 *   score = round( Σ(peso_i · atende_i) / Σ(peso_i) · 100 )
 * onde `atende_i` ∈ {0,1}. Cada critério vira um "motivo" exibível na UI.
 *
 * Os pesos abaixo são o ponto de partida e devem ser validados com o negócio.
 */

export const ATHLETE_MATCH_WEIGHTS = {
  sport: 25,
  region: 20,
  investmentRange: 15,
  sponsorshipType: 10,
  audience: 10,
  benefits: 10,
  category: 5,
  availability: 5,
} as const;

export const PROJECT_MATCH_WEIGHTS = {
  sport: 25,
  region: 20,
  fundingModel: 20,
  investmentRange: 15,
  socialImpact: 15,
  objectives: 5,
} as const;

export interface CompanyMatchProfile {
  sports: string[];
  states: string[];
  minInvestmentCents: number | null;
  maxInvestmentCents: number | null;
  investmentModel: InvestmentModel;
  desiredBenefits: string[];
  objectives: string[];
  audienceTags: string[];
}

export interface AthleteMatchProfile {
  sport: string;
  state: string;
  category: string;
  investmentNeedCents: number | null;
  acceptsDirect: boolean;
  acceptsIncentive: boolean;
  offeredBenefits: string[];
  audienceTags: string[];
  availableForCampaigns: boolean;
}

export interface ProjectMatchProfile {
  sport: string;
  state: string;
  fundingModel: FundingModel;
  remainingCents: number;
  hasSocialImpact: boolean;
  objectives: string[];
}

function intersects(a: string[], b: string[]): boolean {
  return a.some((x) => b.includes(x));
}

function withinRange(
  value: number | null,
  min: number | null,
  max: number | null,
): boolean {
  if (value == null) return min == null; // sem necessidade informada => compatível se empresa é flexível
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

function sponsorshipTypeCompatible(
  model: InvestmentModel,
  acceptsDirect: boolean,
  acceptsIncentive: boolean,
): boolean {
  if (model === 'both') return acceptsDirect || acceptsIncentive;
  if (model === 'direct') return acceptsDirect;
  return acceptsIncentive;
}

function score(reasons: MatchReason[]): MatchResult {
  const total = reasons.reduce((sum, r) => sum + r.weight, 0);
  const achieved = reasons.reduce((sum, r) => sum + (r.matched ? r.weight : 0), 0);
  return {
    score: total === 0 ? 0 : Math.round((achieved / total) * 100),
    reasons,
  };
}

/** Compatibilidade empresa × atleta. */
export function computeAthleteMatch(
  company: CompanyMatchProfile,
  athlete: AthleteMatchProfile,
): MatchResult {
  const w = ATHLETE_MATCH_WEIGHTS;
  const reasons: MatchReason[] = [
    {
      label: 'Modalidade compatível',
      weight: w.sport,
      matched: company.sports.length === 0 || company.sports.includes(athlete.sport),
    },
    {
      label: 'Região prioritária',
      weight: w.region,
      matched: company.states.length === 0 || company.states.includes(athlete.state),
    },
    {
      label: 'Faixa de investimento adequada',
      weight: w.investmentRange,
      matched: withinRange(
        athlete.investmentNeedCents,
        company.minInvestmentCents,
        company.maxInvestmentCents,
      ),
    },
    {
      label: 'Tipo de patrocínio compatível',
      weight: w.sponsorshipType,
      matched: sponsorshipTypeCompatible(
        company.investmentModel,
        athlete.acceptsDirect,
        athlete.acceptsIncentive,
      ),
    },
    {
      label: 'Perfil de público relacionado',
      weight: w.audience,
      matched:
        company.audienceTags.length === 0 ||
        intersects(company.audienceTags, athlete.audienceTags),
    },
    {
      label: 'Contrapartidas compatíveis',
      weight: w.benefits,
      matched:
        company.desiredBenefits.length === 0 ||
        intersects(company.desiredBenefits, athlete.offeredBenefits),
    },
    {
      label: 'Categoria relevante',
      weight: w.category,
      matched: ['profissional', 'olimpico', 'paralimpico'].includes(athlete.category),
    },
    {
      label: 'Disponível para campanhas',
      weight: w.availability,
      matched: athlete.availableForCampaigns,
    },
  ];
  return score(reasons);
}

/** Compatibilidade empresa × projeto. */
export function computeProjectMatch(
  company: CompanyMatchProfile,
  project: ProjectMatchProfile,
): MatchResult {
  const w = PROJECT_MATCH_WEIGHTS;
  const modelCompatible =
    company.investmentModel === 'both' ||
    (company.investmentModel === 'incentive' &&
      (project.fundingModel === 'incentive' || project.fundingModel === 'mixed')) ||
    (company.investmentModel === 'direct' &&
      (project.fundingModel === 'direct' || project.fundingModel === 'mixed'));

  const reasons: MatchReason[] = [
    {
      label: 'Modalidade compatível',
      weight: w.sport,
      matched: company.sports.length === 0 || company.sports.includes(project.sport),
    },
    {
      label: 'Região prioritária',
      weight: w.region,
      matched: company.states.length === 0 || company.states.includes(project.state),
    },
    {
      label: 'Modelo de financiamento compatível',
      weight: w.fundingModel,
      matched: modelCompatible,
    },
    {
      label: 'Faixa de investimento adequada',
      weight: w.investmentRange,
      matched:
        company.maxInvestmentCents == null || project.remainingCents <= company.maxInvestmentCents,
    },
    {
      label: 'Impacto social relevante',
      weight: w.socialImpact,
      matched: project.hasSocialImpact,
    },
    {
      label: 'Objetivos de marca relacionados',
      weight: w.objectives,
      matched:
        company.objectives.length === 0 || intersects(company.objectives, project.objectives),
    },
  ];
  return score(reasons);
}

/** Faixa qualitativa do score, para rótulos/badges. */
export function matchTier(scoreValue: number): 'alto' | 'medio' | 'baixo' {
  if (scoreValue >= 75) return 'alto';
  if (scoreValue >= 50) return 'medio';
  return 'baixo';
}
