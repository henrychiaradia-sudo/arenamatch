'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import {
  profileBasicsSchema,
  athleteProfileSchema,
  companyProfileSchema,
  managerProfileSchema,
  achievementSchema,
  socialAccountSchema,
  sponsorshipNeedSchema,
  parseTags,
  type ProfileBasicsInput,
  type AthleteProfileInput,
  type CompanyProfileInput,
  type ManagerProfileInput,
  type AchievementInput,
  type SocialAccountInput,
  type SponsorshipNeedInput,
} from '@/schemas/profile';

type Result = { ok: true } | { ok: false; error: string };

const nn = (v: string | undefined | null) => (v == null || v === '' ? null : v);
const reaisToCents = (v: number | undefined) => (v == null ? null : Math.round(v * 100));

function revalidateProfile() {
  revalidatePath('/painel/perfil');
  revalidatePath('/painel');
  revalidatePath('/onboarding');
}

async function getAthleteId(uid: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('athlete_profiles')
    .select('id')
    .eq('profile_id', uid)
    .maybeSingle();
  return data?.id ?? null;
}

// ---------------------------------------------------------------- básico
export async function updateProfileBasics(input: ProfileBasicsInput): Promise<Result> {
  const parsed = profileBasicsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.fullName, headline: nn(parsed.data.headline) })
    .eq('id', session.userId);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

export async function completeOnboarding(): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', session.userId);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

// ---------------------------------------------------------------- imagens
export async function setAvatar(url: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('id', session.userId);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

export async function setCover(url: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const table = session.profile.role === 'company' ? 'company_profiles' : 'athlete_profiles';
  const { error } = await supabase.from(table).update({ cover_url: url }).eq('profile_id', session.userId);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

export async function setLogo(url: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('company_profiles')
    .update({ logo_url: url })
    .eq('profile_id', session.userId);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

// ---------------------------------------------------------------- atleta
export async function updateAthleteProfile(input: AthleteProfileInput): Promise<Result> {
  const parsed = athleteProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const d = parsed.data;
  const supabase = createClient();

  let sportId: string | null = null;
  if (d.sportSlug) {
    const { data: sport } = await supabase.from('sports').select('id, is_paralympic').eq('slug', d.sportSlug).maybeSingle();
    sportId = sport?.id ?? null;
  }

  const { error } = await supabase
    .from('athlete_profiles')
    .update({
      sport_id: sportId,
      category: nn(d.category),
      city: nn(d.city),
      state: nn(d.state),
      gender: nn(d.gender),
      bio: nn(d.bio),
      story: nn(d.story),
      team: nn(d.team),
      federation: nn(d.federation),
      ranking: nn(d.ranking),
      followers_total: d.followersTotal ?? null,
      engagement_rate: d.engagementRate ?? null,
      investment_need_cents: reaisToCents(d.investmentNeedReais),
      fundraising_goal: nn(d.fundraisingGoal),
      accepts_direct: d.acceptsDirect,
      accepts_incentive: d.acceptsIncentive,
      available_for_campaigns: d.availableForCampaigns,
      audience_tags: parseTags(d.audienceTags),
    })
    .eq('profile_id', session.userId);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

export async function addAchievement(input: AchievementInput): Promise<Result> {
  const parsed = achievementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const athleteId = await getAthleteId(session.userId);
  if (!athleteId) return { ok: false, error: 'Perfil de atleta não encontrado.' };
  const supabase = createClient();
  const { error } = await supabase.from('achievements').insert({
    athlete_profile_id: athleteId,
    title: parsed.data.title,
    description: nn(parsed.data.description),
    year: parsed.data.year ?? null,
    position: nn(parsed.data.position),
  });
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

export async function deleteAchievement(id: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase.from('achievements').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

export async function upsertSocialAccount(input: SocialAccountInput): Promise<Result> {
  const parsed = socialAccountSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase.from('social_accounts').upsert(
    {
      profile_id: session.userId,
      platform: parsed.data.platform,
      handle: nn(parsed.data.handle),
      url: nn(parsed.data.url),
      followers: parsed.data.followers ?? null,
    },
    { onConflict: 'profile_id,platform' },
  );
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

export async function deleteSocialAccount(id: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase.from('social_accounts').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

export async function setAthleteBenefits(benefitSlugs: string[]): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const athleteId = await getAthleteId(session.userId);
  if (!athleteId) return { ok: false, error: 'Perfil de atleta não encontrado.' };
  const supabase = createClient();

  const { data: benefits } = await supabase.from('benefits').select('id, slug').in('slug', benefitSlugs);
  const ids = (benefits ?? []).map((b) => b.id);

  await supabase.from('athlete_benefits').delete().eq('athlete_profile_id', athleteId);
  if (ids.length > 0) {
    const { error } = await supabase
      .from('athlete_benefits')
      .insert(ids.map((benefit_id) => ({ athlete_profile_id: athleteId, benefit_id })));
    if (error) return { ok: false, error: error.message };
  }
  revalidateProfile();
  return { ok: true };
}

export async function addSponsorshipNeed(input: SponsorshipNeedInput): Promise<Result> {
  const parsed = sponsorshipNeedSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const athleteId = await getAthleteId(session.userId);
  if (!athleteId) return { ok: false, error: 'Perfil de atleta não encontrado.' };
  const supabase = createClient();
  const { error } = await supabase.from('sponsorship_needs').insert({
    athlete_profile_id: athleteId,
    title: parsed.data.title,
    description: nn(parsed.data.description),
    amount_cents: reaisToCents(parsed.data.amountReais),
  });
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

export async function deleteSponsorshipNeed(id: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase.from('sponsorship_needs').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

// ---------------------------------------------------------------- empresa
export async function updateCompanyProfile(input: CompanyProfileInput): Promise<Result> {
  const parsed = companyProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const d = parsed.data;
  const supabase = createClient();
  const { error } = await supabase
    .from('company_profiles')
    .update({
      legal_name: nn(d.legalName),
      public_name: nn(d.publicName),
      segment: nn(d.segment),
      size: nn(d.size),
      city: nn(d.city),
      state: nn(d.state),
      description: nn(d.description),
      website: nn(d.website),
      investment_model: d.investmentModel,
      min_investment_cents: reaisToCents(d.minInvestmentReais),
      max_investment_cents: reaisToCents(d.maxInvestmentReais),
      objectives: parseTags(d.objectives),
      priority_states: d.priorityStates ?? [],
      sports_interest: d.sportsInterest ?? [],
    })
    .eq('profile_id', session.userId);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}

// ---------------------------------------------------------------- gestor
export async function updateManagerProfile(input: ManagerProfileInput): Promise<Result> {
  const parsed = managerProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const d = parsed.data;
  const supabase = createClient();
  const { error } = await supabase
    .from('manager_profiles')
    .update({
      is_organization: d.isOrganization,
      org_name: nn(d.orgName),
      experience: nn(d.experience),
      areas: parseTags(d.areas),
    })
    .eq('profile_id', session.userId);
  if (error) return { ok: false, error: error.message };
  revalidateProfile();
  return { ok: true };
}
