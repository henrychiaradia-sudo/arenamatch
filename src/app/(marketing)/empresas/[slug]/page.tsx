import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeCheck, Globe, MapPin, Megaphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileActions } from '@/features/profile/profile-actions';
import { ReportButton } from '@/features/moderation/report-button';
import { BlockButton } from '@/features/moderation/block-button';
import { getInitials } from '@/lib/utils';
import { formatCurrencyRange } from '@/lib/format';
import { investmentModelLabels } from '@/types/enums';
import { SPORTS } from '@/lib/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

const sportName = (slug: string) => SPORTS.find((s) => s.slug === slug)?.label ?? slug;

export default async function EmpresaPublicPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: c } = await supabase
    .from('company_profiles')
    .select('*, profile:profiles(id, verification_status)')
    .eq('slug', params.slug)
    .is('deleted_at', null)
    .maybeSingle();

  if (!c) notFound();

  const profile = pickOne<{ id: string; verification_status: string }>(c.profile);
  const verified = profile?.verification_status === 'verified';
  const name = (c.public_name as string) ?? (c.legal_name as string) ?? 'Empresa';

  const session = await getSession();
  let favorited = false;
  if (session) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('profile_id', session.userId)
      .eq('target_type', 'company')
      .eq('target_id', c.id)
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

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, slug, title, min_investment_cents, max_investment_cents, investment_model')
    .eq('company_profile_id', c.id)
    .eq('status', 'open')
    .limit(10);

  const sportsInterest = (c.sports_interest as string[]) ?? [];
  const objectives = (c.objectives as string[]) ?? [];
  const priorityStates = (c.priority_states as string[]) ?? [];

  return (
    <div className="pb-16">
      <div className="relative h-40 w-full bg-gradient-to-br from-primary/20 to-success/15 md:h-56">
        {c.cover_url ? (
          <Image src={c.cover_url as string} alt="" fill className="object-cover" sizes="100vw" priority />
        ) : null}
      </div>

      <div className="container -mt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="h-24 w-24 rounded-xl border-4 border-background shadow">
              {c.logo_url ? <AvatarImage src={c.logo_url as string} alt="" /> : null}
              <AvatarFallback className="rounded-xl text-xl">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{name}</h1>
                {verified ? <BadgeCheck className="h-5 w-5 text-primary" /> : null}
              </div>
              <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                {c.segment ? <span>{c.segment as string}</span> : null}
                {c.city || c.state ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {[c.city, c.state].filter(Boolean).join('/')}
                  </span>
                ) : null}
                {c.website ? (
                  <a
                    href={c.website as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> Site
                  </a>
                ) : null}
              </p>
            </div>
          </div>
          <ProfileActions
            targetType="company"
            targetId={c.id as string}
            initialFavorited={favorited}
            isLoggedIn={!!session}
            interestTargetProfileId={profile?.id}
            isSelf={session?.userId === profile?.id}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {c.description ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sobre a empresa</CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-line text-sm text-muted-foreground">
                  {c.description as string}
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Megaphone className="h-4 w-4 text-primary" /> Oportunidades abertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(opportunities ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma oportunidade aberta no momento.</p>
                ) : (
                  (opportunities ?? []).map((o) => (
                    <Link
                      key={o.id}
                      href={o.slug ? `/oportunidades/${o.slug}` : '#'}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                    >
                      <span className="font-medium">{o.title}</span>
                      <span className="text-muted-foreground">
                        {formatCurrencyRange(o.min_investment_cents, o.max_investment_cents)}
                      </span>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preferências</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Investimento</p>
                  <p className="font-semibold">
                    {formatCurrencyRange(c.min_investment_cents as number | null, c.max_investment_cents as number | null)}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {investmentModelLabels[(c.investment_model as keyof typeof investmentModelLabels) ?? 'both']}
                  </Badge>
                </div>
                {sportsInterest.length > 0 ? (
                  <div>
                    <p className="mb-1 text-muted-foreground">Modalidades de interesse</p>
                    <div className="flex flex-wrap gap-1">
                      {sportsInterest.map((s) => (
                        <Badge key={s} variant="secondary">
                          {sportName(s)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {priorityStates.length > 0 ? (
                  <div>
                    <p className="mb-1 text-muted-foreground">Regiões prioritárias</p>
                    <div className="flex flex-wrap gap-1">
                      {priorityStates.map((s) => (
                        <Badge key={s} variant="outline">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {objectives.length > 0 ? (
                  <div>
                    <p className="mb-1 text-muted-foreground">Objetivos</p>
                    <div className="flex flex-wrap gap-1">
                      {objectives.map((o) => (
                        <Badge key={o} variant="secondary">
                          {o}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
            {session && session.userId !== profile?.id ? (
              <div className="flex justify-center gap-2">
                <ReportButton targetType="company" targetId={c.id as string} isLoggedIn />
                {profile?.id ? <BlockButton targetProfileId={profile.id} initialBlocked={blocked} /> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
