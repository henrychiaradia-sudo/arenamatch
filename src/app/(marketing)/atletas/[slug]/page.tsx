import Image from 'next/image';
import { notFound } from 'next/navigation';
import { BadgeCheck, Trophy, CalendarDays, Users, TrendingUp, Target, Handshake, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { MatchScore } from '@/components/ui/match-score';
import { computeAthleteMatch } from '@/lib/matching/engine';
import { buildAthleteMatchProfile, getCompanyMatchProfileForUser } from '@/lib/matching/data';
import type { MatchResult } from '@/types/app';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ProfileActions } from '@/features/profile/profile-actions';
import { StartDealButton } from '@/features/deals/start-deal-button';
import { ReportButton } from '@/features/moderation/report-button';
import { BlockButton } from '@/features/moderation/block-button';
import { getInitials } from '@/lib/utils';
import { formatCurrency, formatCompactNumber, formatDate, formatPercent } from '@/lib/format';
import { investmentModelLabels } from '@/types/enums';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function completeness(a: Record<string, unknown>): number {
  const fields = [a.sport_id, a.category, a.city, a.state, a.bio, a.story, a.investment_need_cents, a.cover_url];
  return Math.max(10, Math.round((fields.filter(Boolean).length / fields.length) * 100));
}

export default async function AtletaPublicPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: a } = await supabase
    .from('athlete_profiles')
    .select(
      '*, profile:profiles(id, full_name, avatar_url, verification_status), sport:sports(name, slug), achievements(id, title, description, year, position), competitions(id, name, location, starts_on, ends_on), athlete_benefits(benefit:benefits(slug, name))',
    )
    .eq('slug', params.slug)
    .is('deleted_at', null)
    .maybeSingle();

  if (!a) notFound();

  const profile = pickOne<{ id: string; full_name: string | null; avatar_url: string | null; verification_status: string }>(a.profile);
  const sport = pickOne<{ name: string; slug: string }>(a.sport);
  const verified = profile?.verification_status === 'verified';
  const pct = completeness(a as Record<string, unknown>);

  const session = await getSession();
  let favorited = false;
  if (session) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('profile_id', session.userId)
      .eq('target_type', 'athlete')
      .eq('target_id', a.id)
      .maybeSingle();
    favorited = !!fav;
  }

  let blocked = false;
  if (session && profile?.id && session.userId !== profile.id) {
    const { data: blk } = await supabase
      .from('blocks')
      .select('id')
      .eq('blocker_profile_id', session.userId)
      .eq('blocked_profile_id', profile.id)
      .maybeSingle();
    blocked = !!blk;
  }

  const { data: socials } = await supabase
    .from('social_accounts')
    .select('id, platform, handle, url, followers')
    .eq('profile_id', profile?.id ?? '');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const achievements = (a.achievements ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const competitions = (a.competitions ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const benefits = ((a.athlete_benefits ?? []) as any[])
    .map((b) => pickOne<{ slug: string; name: string }>(b.benefit))
    .filter(Boolean) as { slug: string; name: string }[];

  let matchResult: MatchResult | null = null;
  if (session?.profile.role === 'company') {
    const companyMatch = await getCompanyMatchProfileForUser(session.userId);
    if (companyMatch) {
      matchResult = computeAthleteMatch(
        companyMatch,
        buildAthleteMatchProfile(a, sport?.slug ?? '', benefits.map((b) => b.slug)),
      );
    }
  }

  return (
    <div className="pb-16">
      {/* Capa */}
      <div className="relative h-48 w-full bg-gradient-to-br from-primary/25 to-success/20 md:h-64">
        {a.cover_url ? (
          <Image src={a.cover_url as string} alt="" fill className="object-cover" sizes="100vw" priority />
        ) : null}
      </div>

      <div className="container -mt-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="h-28 w-28 border-4 border-background shadow">
              {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
              <AvatarFallback className="text-2xl">{getInitials(profile?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{profile?.full_name ?? 'Atleta'}</h1>
                {verified ? <BadgeCheck className="h-5 w-5 text-primary" /> : null}
              </div>
              <p className="text-muted-foreground">
                {[sport?.name, a.category, [a.city, a.state].filter(Boolean).join('/')]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <ProfileActions
              targetType="athlete"
              targetId={a.id as string}
              initialFavorited={favorited}
              isLoggedIn={!!session}
              interestTargetProfileId={profile?.id}
              isSelf={session?.userId === profile?.id}
            />
            {session?.profile.role === 'company' && profile?.id ? (
              <StartDealButton
                athleteProfileId={a.id as string}
                counterpartProfileId={profile.id}
                athleteName={profile.full_name ?? 'atleta'}
              />
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Coluna principal */}
          <div className="space-y-6 lg:col-span-2">
            {a.bio || a.story ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sobre</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {a.bio ? <p className="font-medium">{a.bio as string}</p> : null}
                  {a.story ? <p className="whitespace-pre-line text-muted-foreground">{a.story as string}</p> : null}
                </CardContent>
              </Card>
            ) : null}

            {achievements.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="h-4 w-4 text-primary" /> Conquistas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.map((ac) => (
                    <div key={ac.id} className="text-sm">
                      <p className="font-medium">
                        {ac.title} {ac.year ? <span className="text-muted-foreground">· {ac.year}</span> : null}
                      </p>
                      {ac.position ? <p className="text-muted-foreground">{ac.position}</p> : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {competitions.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="h-4 w-4 text-primary" /> Calendário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {competitions.map((c) => (
                    <div key={c.id} className="flex justify-between">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{formatDate(c.starts_on)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {benefits.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Handshake className="h-4 w-4 text-primary" /> Contrapartidas oferecidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {benefits.map((b) => (
                    <Badge key={b.slug} variant="secondary">
                      {b.name}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Coluna lateral */}
          <div className="space-y-6">
            {matchResult ? (
              <Card className="border-primary/40">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    Compatibilidade <MatchScore score={matchResult.score} showLabel={false} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {matchResult.reasons
                    .filter((r) => r.matched)
                    .map((r) => (
                      <p key={r.label} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-success" /> {r.label}
                      </p>
                    ))}
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Números</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" /> Seguidores
                  </span>
                  <span className="font-semibold">{formatCompactNumber(a.followers_total as number | null)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" /> Engajamento
                  </span>
                  <span className="font-semibold">
                    {a.engagement_rate ? formatPercent(a.engagement_rate as number) : '—'}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4" /> Necessidade
                  </span>
                  <span className="font-semibold">{formatCurrency(a.investment_need_cents as number | null)}</span>
                </div>
                {a.fundraising_goal ? (
                  <p className="text-xs text-muted-foreground">Objetivo: {a.fundraising_goal as string}</p>
                ) : null}
                <div className="flex flex-wrap gap-1 pt-1">
                  {a.accepts_direct ? <Badge variant="outline">{investmentModelLabels.direct}</Badge> : null}
                  {a.accepts_incentive ? <Badge variant="outline">{investmentModelLabels.incentive}</Badge> : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-muted-foreground">Completude</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <Progress value={pct} />
                </div>
                {a.team ? <p><span className="text-muted-foreground">Equipe:</span> {a.team as string}</p> : null}
                {a.federation ? <p><span className="text-muted-foreground">Federação:</span> {a.federation as string}</p> : null}
                {a.ranking ? <p><span className="text-muted-foreground">Ranking:</span> {a.ranking as string}</p> : null}
              </CardContent>
            </Card>

            {(socials ?? []).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Redes sociais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(socials ?? []).map((s) => (
                    <div key={s.id} className="flex justify-between">
                      <span>{s.platform}</span>
                      <span className="text-muted-foreground">
                        {s.followers ? formatCompactNumber(s.followers) : s.handle}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {session && session.userId !== profile?.id ? (
              <div className="flex justify-center gap-2">
                <ReportButton targetType="athlete" targetId={a.id as string} isLoggedIn />
                {profile?.id ? <BlockButton targetProfileId={profile.id} initialBlocked={blocked} /> : null}
              </div>
            ) : null}

            <p className="text-center text-xs text-muted-foreground">
              Dados cadastrados pelo usuário podem depender de validação documental.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
