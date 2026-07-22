import type { UserRole } from '@/types/enums';
import type { PlanTier } from '@/types/enums';
import { getEntitlements, hasReachedLimit, type PlanEntitlements } from '@/config/plans';

/**
 * Guardas de permissão e verificação de entitlements.
 * A fonte da verdade dos limites é o servidor; o front usa estas funções para
 * refletir estado (ex.: desabilitar um botão quando o limite foi atingido).
 */

/** Verifica se um papel está entre os permitidos. */
export function hasRole(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role);
}

/** Retorna os entitlements do plano do usuário. */
export function entitlementsFor(planTier: PlanTier): PlanEntitlements {
  return getEntitlements(planTier);
}

/** Pode iniciar uma nova candidatura? */
export function canApply(planTier: PlanTier, currentApplications: number): boolean {
  const e = getEntitlements(planTier);
  return !hasReachedLimit(e.maxApplications, currentApplications);
}

/** Pode publicar uma nova oportunidade? */
export function canCreateOpportunity(planTier: PlanTier, currentActive: number): boolean {
  const e = getEntitlements(planTier);
  return !hasReachedLimit(e.maxActiveOpportunities, currentActive);
}

/** Pode adicionar mais um favorito? */
export function canFavorite(planTier: PlanTier, currentFavorites: number): boolean {
  const e = getEntitlements(planTier);
  return !hasReachedLimit(e.maxFavorites, currentFavorites);
}

/** Tem acesso ao pipeline (CRM)? */
export function canUsePipeline(planTier: PlanTier): boolean {
  return getEntitlements(planTier).pipeline;
}

/** Tem acesso à busca avançada? */
export function canUseAdvancedSearch(planTier: PlanTier): boolean {
  return getEntitlements(planTier).advancedSearch;
}
