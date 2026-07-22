import Link from 'next/link';
import { Megaphone, Star, Handshake, ClipboardCheck, Search, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MatchScore } from '@/components/ui/match-score';
import { computeAthleteMatch } from '@/lib/matching/engine';
import { buildAthleteMatchProfile, getCompanyMatchProfileForUser } from '@/lib/matching/data';
import { formatNumber } from '@/lib/format';
import { getInitials } from '@/lib/utils';
import type { SessionContext } from '@/types/app';

export async function CompanyDashboard({ session }: { session: SessionContext }) {
  const supabase = createClient();
  const uid = session.userId;

  const { data: company } = await supabase
    .from('company_profiles')
    .select('id')
    .eq('profile_id', uid)
    .maybeSingle();
  const companyId = company?.id ?? '00000000-0000-0000-0000-000000000000';

  const [opps, favs, deals, deliverables] = await Promise.all([
    supabase
      .from('opportunities')
      .select('id', { count: 'exact', head: true })
      .eq('company_profile_id', companyId),
    supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('profile_id', uid),
    supabase
      .from('deals')
      .select('id', { count: 'exact', head: true })
      .eq('company_profile_id', companyId),
    supabase
      .from('deliverables')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'completed'),
  ]);

  // Matches recomendados
  const companyMatch = await getCompanyMatchProfileForUser(uid);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let matches: { r: any; score: number }[] = [];
  if (companyMatch) {
    const { data: athleteRows } = await supabase
      .from('athlete_profiles')
      .select('id, slug, state, category, investment_need_cents, accepts_direct, accepts_incentive, audience_tags, available_for_campaigns, profile:profiles(full_name, avatar_url), sport:sports(name, slug), athlete_benefits(benefit:benefits(slug))')
      .is('deleted_at', null)
      .limit(20);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matches = ((athleteRows ?? []) as any[])
      .map((r) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const benefitSlugs = (r.athlete_benefits ?? []).map((b: any) => b.benefit?.slug).filter(Boolean);
        const score = computeAthleteMatch(
          companyMatch,
          buildAthleteMatchProfile(r, r.sport?.slug ?? '', benefitSlugs),
        ).score;
        return { r, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${session.profile.fullName.split(' ')[0]} 👋`}
        description="Encontre atletas e projetos, publique oportunidades e gerencie negociações."
        actions={
          <Button asChild>
            <Link href="/explorar/atletas">
              <Search className="h-4 w-4" /> Buscar atletas
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Oportunidades" value={formatNumber(opps.count ?? 0)} icon={Megaphone} />
        <StatCard label="Favoritos" value={formatNumber(favs.count ?? 0)} icon={Star} />
        <StatCard label="Negociações" value={formatNumber(deals.count ?? 0)} icon={Handshake} />
        <StatCard
          label="Contrapartidas pendentes"
          value={formatNumber(deliverables.count ?? 0)}
          icon={ClipboardCheck}
        />
      </div>

      {matches.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> Matches recomendados
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {matches.map(({ r, score }) => (
              <Link
                key={r.id}
                href={r.slug ? `/atletas/${r.slug}` : '#'}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <Avatar>
                  {r.profile?.avatar_url ? <AvatarImage src={r.profile.avatar_url} alt="" /> : null}
                  <AvatarFallback>{getInitials(r.profile?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.profile?.full_name ?? 'Atleta'}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.sport?.name}</p>
                </div>
                <MatchScore score={score} showLabel={false} />
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos passos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/painel/perfil">Completar perfil da empresa</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/painel/oportunidades">Publicar uma oportunidade</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/painel/pipeline">Abrir o pipeline</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
