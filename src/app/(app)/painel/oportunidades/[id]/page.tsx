import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OpportunityForm } from '@/features/opportunities/opportunity-form';
import { ApplicantsList, type Applicant } from '@/features/opportunities/applicants-list';
import type { InvestmentModel } from '@/types/enums';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function EditarOportunidadePage({ params }: { params: { id: string } }) {
  await requireRole('company');
  const supabase = createClient();

  const { data: o } = await supabase
    .from('opportunities')
    .select('*, opportunity_sports(sport:sports(slug))')
    .eq('id', params.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!o) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sportsSlugs = ((o.opportunity_sports ?? []) as any[])
    .map((os) => pickOne<{ slug: string }>(os.sport)?.slug)
    .filter((s): s is string => Boolean(s));

  const { data: appRows } = await supabase
    .from('applications')
    .select('id, status, message, applicant:profiles(full_name, avatar_url), athlete:athlete_profiles(slug)')
    .eq('opportunity_id', params.id)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applicants: Applicant[] = ((appRows ?? []) as any[]).map((r) => {
    const p = pickOne<{ full_name: string | null; avatar_url: string | null }>(r.applicant);
    const ath = pickOne<{ slug: string | null }>(r.athlete);
    return {
      id: r.id,
      status: r.status,
      message: r.message,
      fullName: p?.full_name ?? null,
      avatarUrl: p?.avatar_url ?? null,
      athleteSlug: ath?.slug ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Editar oportunidade" description={o.title ?? ''} />
      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="candidatos">Candidatos ({applicants.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="dados" className="mt-6">
          <OpportunityForm
            mode="edit"
            opportunityId={params.id}
            desiredBenefits={(o.desired_benefits as string[]) ?? []}
            sportsSlugs={sportsSlugs}
            scalars={{
              title: o.title ?? '',
              description: o.description ?? '',
              campaignGoal: o.campaign_goal ?? '',
              desiredAthleteProfile: o.desired_athlete_profile ?? '',
              investmentModel: (o.investment_model as InvestmentModel) ?? 'both',
              minInvestmentReais: o.min_investment_cents ? o.min_investment_cents / 100 : undefined,
              maxInvestmentReais: o.max_investment_cents ? o.max_investment_cents / 100 : undefined,
              resourceType: o.resource_type ?? '',
              duration: o.duration ?? '',
              deadline: o.deadline ?? '',
              estimatedSlots: o.estimated_slots ?? undefined,
              requirements: o.requirements ?? '',
              criteria: o.criteria ?? '',
              regionStates: ((o.region_states as string[]) ?? []).join(', '),
            }}
          />
        </TabsContent>
        <TabsContent value="candidatos" className="mt-6">
          <ApplicantsList items={applicants} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
