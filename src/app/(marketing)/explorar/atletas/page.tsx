import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, BadgeCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { MatchScore } from '@/components/ui/match-score';
import { computeAthleteMatch } from '@/lib/matching/engine';
import { buildAthleteMatchProfile, getCompanyMatchProfileForUser } from '@/lib/matching/data';
import { PageIntro } from '@/components/marketing/page-intro';
import { ExploreFilters } from '@/features/explore/explore-filters';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { formatCurrency, formatCompactNumber } from '@/lib/format';
import { getInitials } from '@/lib/utils';

export const metadata: Metadata = { title: 'Explorar atletas' };

interface Row {
  id: string;
  slug: string | null;
  category: string | null;
  city: string | null;
  state: string | null;
  followers_total: number | null;
  investment_need_cents: number | null;
  profile: { full_name: string | null; avatar_url: string | null; verification_status: string } | null;
  sport: { name: string | null; slug: string | null } | null;
  matchScore?: number;
}

export default async function ExplorarAtletasPage({
  searchParams,
}: {
  searchParams: { q?: string; sport?: string; state?: string; page?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let sportId: string | undefined;
  if (searchParams.sport) {
    const { data: sport } = await supabase
      .from('sports')
      .select('id')
      .eq('slug', searchParams.sport)
      .maybeSingle();
    sportId = sport?.id;
  }

  let query = supabase
    .from('athlete_profiles')
    .select(
      'id, slug, category, city, state, followers_total, investment_need_cents, accepts_direct, accepts_incentive, audience_tags, available_for_campaigns, profile:profiles(full_name, avatar_url, verification_status), sport:sports(name, slug), athlete_benefits(benefit:benefits(slug))',
      { count: 'exact' },
    )
    .is('deleted_at', null);

  if (searchParams.state) query = query.eq('state', searchParams.state);
  if (sportId) query = query.eq('sport_id', sportId);

  const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  // Match: se o visitante for uma empresa, calcula a compatibilidade.
  const session = await getSession();
  const companyMatch =
    session?.profile.role === 'company'
      ? await getCompanyMatchProfileForUser(session.userId)
      : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = ((data ?? []) as any[]).map((r) => {
    let matchScore: number | undefined;
    if (companyMatch) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const benefitSlugs = (r.athlete_benefits ?? []).map((b: any) => b.benefit?.slug).filter(Boolean);
      const sportSlug = r.sport?.slug ?? '';
      matchScore = computeAthleteMatch(companyMatch, buildAthleteMatchProfile(r, sportSlug, benefitSlugs)).score;
    }
    return { ...r, matchScore } as Row;
  });

  return (
    <>
      <PageIntro
        eyebrow="Descoberta"
        title="Explorar atletas"
        description="Encontre atletas por modalidade, região e mais."
      />
      <section className="container space-y-6 py-10">
        <ExploreFilters
          action="/explorar/atletas"
          showSport
          showState
          values={searchParams}
        />

        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum atleta encontrado"
            description="Ajuste os filtros ou volte quando houver atletas cadastrados. Popule o banco com o seed de demonstração para ver exemplos."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((a) => (
              <Card key={a.id} className="overflow-hidden">
                <div className="h-16 bg-gradient-to-br from-primary/20 to-success/20" />
                <CardContent className="-mt-8 flex flex-col items-center text-center">
                  <Avatar className="h-14 w-14 border-4 border-background">
                    {a.profile?.avatar_url ? (
                      <AvatarImage src={a.profile.avatar_url} alt={a.profile.full_name ?? ''} />
                    ) : null}
                    <AvatarFallback>{getInitials(a.profile?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="mt-2 flex items-center gap-1">
                    <h3 className="font-semibold">{a.profile?.full_name ?? 'Atleta'}</h3>
                    {a.profile?.verification_status === 'verified' ? (
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {[a.sport?.name, a.city && a.state ? `${a.city}/${a.state}` : a.state]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {a.matchScore != null ? (
                    <div className="mt-2">
                      <MatchScore score={a.matchScore} />
                    </div>
                  ) : null}
                  <div className="mt-3 flex w-full items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                    <span>{formatCompactNumber(a.followers_total)} seg.</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(a.investment_need_cents)}
                    </span>
                  </div>
                  <Link
                    href={a.slug ? `/atletas/${a.slug}` : '#'}
                    className="mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    Ver perfil
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} />
      </section>
    </>
  );
}
