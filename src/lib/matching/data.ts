import { createClient } from '@/lib/supabase/server';
import type { CompanyMatchProfile, AthleteMatchProfile } from '@/lib/matching/engine';
import type { InvestmentModel } from '@/types/enums';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildCompanyMatchProfile(row: any): CompanyMatchProfile {
  return {
    sports: row.sports_interest ?? [],
    states: row.priority_states ?? [],
    minInvestmentCents: row.min_investment_cents ?? null,
    maxInvestmentCents: row.max_investment_cents ?? null,
    investmentModel: (row.investment_model as InvestmentModel) ?? 'both',
    desiredBenefits: [],
    objectives: row.objectives ?? [],
    audienceTags: row.audience_tags ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildAthleteMatchProfile(row: any, sportSlug: string, benefitSlugs: string[]): AthleteMatchProfile {
  return {
    sport: sportSlug,
    state: row.state ?? '',
    category: row.category ?? '',
    investmentNeedCents: row.investment_need_cents ?? null,
    acceptsDirect: row.accepts_direct ?? false,
    acceptsIncentive: row.accepts_incentive ?? false,
    offeredBenefits: benefitSlugs,
    audienceTags: row.audience_tags ?? [],
    availableForCampaigns: row.available_for_campaigns ?? false,
  };
}

/** Retorna o perfil de match da empresa do usuário, ou null. */
export async function getCompanyMatchProfileForUser(uid: string): Promise<CompanyMatchProfile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('company_profiles')
    .select('sports_interest, priority_states, min_investment_cents, max_investment_cents, investment_model, objectives, audience_tags')
    .eq('profile_id', uid)
    .maybeSingle();
  if (!data) return null;
  return buildCompanyMatchProfile(data);
}
