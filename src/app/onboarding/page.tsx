import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingWizard, type WizardStep } from '@/features/onboarding/onboarding-wizard';
import { AthleteProfileForm } from '@/features/profile/athlete-profile-form';
import { BenefitsSelector } from '@/features/profile/benefits-selector';
import { SocialAccountsEditor } from '@/features/profile/social-accounts-editor';
import { AchievementsEditor } from '@/features/profile/achievements-editor';
import { CompanyProfileForm } from '@/features/profile/company-profile-form';
import { ManagerProfileForm } from '@/features/profile/manager-profile-form';
import type { AthleteProfileInput } from '@/schemas/profile';

const centsToReais = (c: number | null | undefined) => (c == null ? undefined : c / 100);
const toStr = (a: string[] | null | undefined) => (a ?? []).join(', ');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function OnboardingPage() {
  const session = await requireSession();
  if (session.profile.onboardingCompleted) redirect('/painel');

  const uid = session.userId;
  const supabase = createClient();
  let steps: WizardStep[] = [];

  if (session.profile.role === 'athlete') {
    const { data: ap } = await supabase
      .from('athlete_profiles')
      .select('*, sport:sports(slug)')
      .eq('profile_id', uid)
      .maybeSingle();
    const athleteId = ap?.id as string | undefined;

    const [socials, benefitRows, achievements] = await Promise.all([
      supabase.from('social_accounts').select('id, platform, handle, url, followers').eq('profile_id', uid),
      athleteId
        ? supabase.from('athlete_benefits').select('benefit:benefits(slug)').eq('athlete_profile_id', athleteId)
        : Promise.resolve({ data: [] }),
      athleteId
        ? supabase
            .from('achievements')
            .select('id, title, description, year, position')
            .eq('athlete_profile_id', athleteId)
            .order('year', { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);

    const sport = pickOne<{ slug: string }>(ap?.sport);
    const defaults: AthleteProfileInput = {
      sportSlug: sport?.slug ?? '',
      category: ap?.category ?? '',
      city: ap?.city ?? '',
      state: ap?.state ?? '',
      gender: ap?.gender ?? '',
      bio: ap?.bio ?? '',
      story: ap?.story ?? '',
      team: ap?.team ?? '',
      federation: ap?.federation ?? '',
      ranking: ap?.ranking ?? '',
      followersTotal: ap?.followers_total ?? undefined,
      engagementRate: ap?.engagement_rate ?? undefined,
      investmentNeedReais: centsToReais(ap?.investment_need_cents),
      fundraisingGoal: ap?.fundraising_goal ?? '',
      acceptsDirect: ap?.accepts_direct ?? true,
      acceptsIncentive: ap?.accepts_incentive ?? false,
      availableForCampaigns: ap?.available_for_campaigns ?? true,
      audienceTags: toStr(ap?.audience_tags),
    };
    const selectedBenefits = (benefitRows.data ?? [])
      .map((r) => pickOne<{ slug: string }>(r.benefit)?.slug)
      .filter((s): s is string => Boolean(s));

    steps = [
      {
        title: 'Perfil e fotos',
        node: (
          <AthleteProfileForm
            userId={uid}
            fullName={session.profile.fullName}
            avatarUrl={session.profile.avatarUrl}
            coverUrl={(ap?.cover_url as string | null) ?? null}
            defaults={defaults}
          />
        ),
      },
      { title: 'Contrapartidas', node: <BenefitsSelector selected={selectedBenefits} /> },
      { title: 'Redes sociais', node: <SocialAccountsEditor items={socials.data ?? []} /> },
      { title: 'Conquistas', node: <AchievementsEditor items={achievements.data ?? []} /> },
    ];
  } else if (session.profile.role === 'company') {
    const { data: cp } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('profile_id', uid)
      .maybeSingle();
    steps = [
      {
        title: 'Perfil da empresa',
        node: (
          <CompanyProfileForm
            userId={uid}
            companyName={cp?.public_name ?? session.profile.fullName}
            logoUrl={(cp?.logo_url as string | null) ?? null}
            coverUrl={(cp?.cover_url as string | null) ?? null}
            sportsInterest={(cp?.sports_interest as string[]) ?? []}
            scalars={{
              legalName: cp?.legal_name ?? '',
              publicName: cp?.public_name ?? '',
              segment: cp?.segment ?? '',
              size: cp?.size ?? '',
              city: cp?.city ?? '',
              state: cp?.state ?? '',
              website: cp?.website ?? '',
              description: cp?.description ?? '',
              investmentModel: cp?.investment_model ?? 'both',
              minInvestmentReais: centsToReais(cp?.min_investment_cents),
              maxInvestmentReais: centsToReais(cp?.max_investment_cents),
              objectives: toStr(cp?.objectives),
              priorityStates: toStr(cp?.priority_states),
            }}
          />
        ),
      },
    ];
  } else if (session.profile.role === 'manager') {
    const { data: mp } = await supabase
      .from('manager_profiles')
      .select('*')
      .eq('profile_id', uid)
      .maybeSingle();
    steps = [
      {
        title: 'Perfil do gestor',
        node: (
          <ManagerProfileForm
            defaults={{
              isOrganization: mp?.is_organization ?? false,
              orgName: mp?.org_name ?? '',
              experience: mp?.experience ?? '',
              areas: toStr(mp?.areas),
            }}
          />
        ),
      },
    ];
  } else {
    redirect('/admin');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Bem-vindo(a), {session.profile.fullName.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Vamos configurar seu perfil. Você pode salvar e continuar depois a qualquer momento.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <OnboardingWizard steps={steps} />
        </CardContent>
      </Card>
    </div>
  );
}
