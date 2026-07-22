import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Target, Users, ListChecks } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ApplyButton } from '@/features/opportunities/apply-button';
import { FavoriteButton } from '@/features/engagement/favorite-button';
import { formatCurrencyRange, formatDate } from '@/lib/format';
import { investmentModelLabels, type InvestmentModel } from '@/types/enums';
import { BENEFIT_TYPES } from '@/lib/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

const benefitName = (slug: string) => BENEFIT_TYPES.find((b) => b.slug === slug)?.label ?? slug;

export default async function OportunidadePublicPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: o } = await supabase
    .from('opportunities')
    .select('*, company:company_profiles(slug, public_name, legal_name)')
    .eq('slug', params.slug)
    .is('deleted_at', null)
    .maybeSingle();

  if (!o) notFound();

  const company = pickOne<{ slug: string | null; public_name: string | null; legal_name: string | null }>(o.company);
  const companyName = company?.public_name ?? company?.legal_name ?? 'Empresa';
  const benefits = (o.desired_benefits as string[]) ?? [];
  const regions = (o.region_states as string[]) ?? [];

  const session = await getSession();
  const canApply = !!session && ['athlete', 'manager'].includes(session.profile.role);
  let alreadyApplied = false;
  let favorited = false;
  if (session) {
    const [{ data: app }, { data: fav }] = await Promise.all([
      supabase
        .from('applications')
        .select('id')
        .eq('opportunity_id', o.id)
        .eq('applicant_profile_id', session.userId)
        .maybeSingle(),
      supabase
        .from('favorites')
        .select('id')
        .eq('profile_id', session.userId)
        .eq('target_type', 'opportunity')
        .eq('target_id', o.id)
        .maybeSingle(),
    ]);
    alreadyApplied = !!app;
    favorited = !!fav;
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="secondary">{investmentModelLabels[o.investment_model as InvestmentModel]}</Badge>
          <h1 className="mt-2 font-display text-2xl font-bold">{o.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {company?.slug ? (
              <Link href={`/empresas/${company.slug}`} className="text-primary hover:underline">
                {companyName}
              </Link>
            ) : (
              companyName
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FavoriteButton
            targetType="opportunity"
            targetId={o.id as string}
            initialFavorited={favorited}
            isLoggedIn={!!session}
          />
          <ApplyButton
            opportunityId={o.id as string}
            isLoggedIn={!!session}
            canApply={canApply}
            alreadyApplied={alreadyApplied}
            isOpen={o.status === 'open'}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {o.description ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Descrição</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm text-muted-foreground">
                {o.description}
              </CardContent>
            </Card>
          ) : null}

          {o.desired_athlete_profile ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" /> Perfil desejado
                </CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm text-muted-foreground">
                {o.desired_athlete_profile}
              </CardContent>
            </Card>
          ) : null}

          {o.requirements || o.criteria ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ListChecks className="h-4 w-4 text-primary" /> Requisitos e critérios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {o.requirements ? (
                  <div>
                    <p className="font-medium">Requisitos</p>
                    <p className="whitespace-pre-line text-muted-foreground">{o.requirements}</p>
                  </div>
                ) : null}
                {o.criteria ? (
                  <div>
                    <p className="font-medium">Critérios de avaliação</p>
                    <p className="whitespace-pre-line text-muted-foreground">{o.criteria}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Target className="h-4 w-4" /> Investimento
                </span>
                <span className="font-semibold">
                  {formatCurrencyRange(o.min_investment_cents, o.max_investment_cents)}
                </span>
              </div>
              {o.resource_type ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recurso</span>
                  <span>{o.resource_type}</span>
                </div>
              ) : null}
              {o.duration ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duração</span>
                  <span>{o.duration}</span>
                </div>
              ) : null}
              {o.deadline ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" /> Inscrições até
                  </span>
                  <span>{formatDate(o.deadline)}</span>
                </div>
              ) : null}
              {o.estimated_slots ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vagas</span>
                  <span>{o.estimated_slots}</span>
                </div>
              ) : null}
              {regions.length > 0 ? (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-muted-foreground">Regiões</p>
                    <div className="flex flex-wrap gap-1">
                      {regions.map((r) => (
                        <Badge key={r} variant="outline">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
              {benefits.length > 0 ? (
                <div>
                  <p className="mb-1 text-muted-foreground">Contrapartidas desejadas</p>
                  <div className="flex flex-wrap gap-1">
                    {benefits.map((b) => (
                      <Badge key={b} variant="secondary">
                        {benefitName(b)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
