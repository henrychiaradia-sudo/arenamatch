'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { slugify } from '@/lib/utils';
import { getEntitlements, hasReachedLimit } from '@/config/plans';
import { opportunitySchema, type OpportunityInput } from '@/schemas/opportunity';
import type { OpportunityStatus, ApplicationStatus } from '@/types/enums';

type Result = { ok: true; id?: string; slug?: string } | { ok: false; error: string };

const nn = (v: string | undefined | null) => (v == null || v === '' ? null : v);
const toCents = (v: number | undefined) => (v == null ? null : Math.round(v * 100));

async function getCompany(uid: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('company_profiles')
    .select('id')
    .eq('profile_id', uid)
    .maybeSingle();
  return data?.id ?? null;
}

async function syncSports(opportunityId: string, sportSlugs: string[]) {
  const supabase = createClient();
  await supabase.from('opportunity_sports').delete().eq('opportunity_id', opportunityId);
  if (sportSlugs.length === 0) return;
  const { data: sports } = await supabase.from('sports').select('id, slug').in('slug', sportSlugs);
  const rows = (sports ?? []).map((s) => ({ opportunity_id: opportunityId, sport_id: s.id }));
  if (rows.length) await supabase.from('opportunity_sports').insert(rows);
}

export async function createOpportunity(input: OpportunityInput): Promise<Result> {
  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session || session.profile.role !== 'company') {
    return { ok: false, error: 'Apenas empresas podem criar oportunidades.' };
  }
  const companyId = await getCompany(session.userId);
  if (!companyId) return { ok: false, error: 'Perfil de empresa não encontrado.' };

  const supabase = createClient();

  // Entitlement: limite de oportunidades por plano.
  const limit = getEntitlements(session.profile.planTier).maxActiveOpportunities;
  const { count } = await supabase
    .from('opportunities')
    .select('id', { count: 'exact', head: true })
    .eq('company_profile_id', companyId)
    .is('deleted_at', null);
  if (hasReachedLimit(limit, count ?? 0)) {
    return {
      ok: false,
      error: 'Você atingiu o limite de oportunidades do seu plano. Faça upgrade para publicar mais.',
    };
  }

  const d = parsed.data;
  const slug = `${slugify(d.title)}-${Date.now().toString(36).slice(-4)}`;
  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      slug,
      company_profile_id: companyId,
      title: d.title,
      description: nn(d.description),
      campaign_goal: nn(d.campaignGoal),
      desired_athlete_profile: nn(d.desiredAthleteProfile),
      investment_model: d.investmentModel,
      min_investment_cents: toCents(d.minInvestmentReais),
      max_investment_cents: toCents(d.maxInvestmentReais),
      resource_type: nn(d.resourceType),
      duration: nn(d.duration),
      deadline: nn(d.deadline),
      estimated_slots: d.estimatedSlots ?? null,
      requirements: nn(d.requirements),
      criteria: nn(d.criteria),
      region_states: d.regionStates ?? [],
      desired_benefits: d.desiredBenefits ?? [],
      status: 'draft',
    })
    .select('id, slug')
    .single();

  if (error) return { ok: false, error: error.message };
  await syncSports(data.id, d.sportsSlugs ?? []);
  revalidatePath('/painel/oportunidades');
  return { ok: true, id: data.id, slug: data.slug };
}

export async function updateOpportunity(id: string, input: OpportunityInput): Promise<Result> {
  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const d = parsed.data;
  const supabase = createClient();
  const { error } = await supabase
    .from('opportunities')
    .update({
      title: d.title,
      description: nn(d.description),
      campaign_goal: nn(d.campaignGoal),
      desired_athlete_profile: nn(d.desiredAthleteProfile),
      investment_model: d.investmentModel,
      min_investment_cents: toCents(d.minInvestmentReais),
      max_investment_cents: toCents(d.maxInvestmentReais),
      resource_type: nn(d.resourceType),
      duration: nn(d.duration),
      deadline: nn(d.deadline),
      estimated_slots: d.estimatedSlots ?? null,
      requirements: nn(d.requirements),
      criteria: nn(d.criteria),
      region_states: d.regionStates ?? [],
      desired_benefits: d.desiredBenefits ?? [],
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await syncSports(id, d.sportsSlugs ?? []);
  revalidatePath('/painel/oportunidades');
  revalidatePath(`/painel/oportunidades/${id}`);
  return { ok: true, id };
}

export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus,
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase.from('opportunities').update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/oportunidades');
  return { ok: true, id };
}

export async function deleteOpportunity(id: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('opportunities')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/oportunidades');
  return { ok: true };
}

// ----------------------------------------------------------- candidaturas
export async function applyToOpportunity(opportunityId: string, message: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Faça login para se candidatar.' };
  if (!['athlete', 'manager'].includes(session.profile.role)) {
    return { ok: false, error: 'Apenas atletas e gestores podem se candidatar.' };
  }
  const supabase = createClient();

  // Entitlement (atleta): limite de candidaturas.
  if (session.profile.role === 'athlete') {
    const limit = getEntitlements(session.profile.planTier).maxApplications;
    const { count } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('applicant_profile_id', session.userId);
    if (hasReachedLimit(limit, count ?? 0)) {
      return { ok: false, error: 'Você atingiu o limite de candidaturas do seu plano.' };
    }
  }

  let athleteProfileId: string | null = null;
  if (session.profile.role === 'athlete') {
    const { data } = await supabase
      .from('athlete_profiles')
      .select('id')
      .eq('profile_id', session.userId)
      .maybeSingle();
    athleteProfileId = data?.id ?? null;
  }

  const { error } = await supabase.from('applications').insert({
    opportunity_id: opportunityId,
    applicant_profile_id: session.userId,
    athlete_profile_id: athleteProfileId,
    message: nn(message),
    status: 'submitted',
  });
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Você já se candidatou a esta oportunidade.' };
    return { ok: false, error: error.message };
  }
  revalidatePath('/painel/candidaturas');
  return { ok: true };
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase.from('applications').update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
