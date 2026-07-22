import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, MapPin, Target, Users, HeartHandshake } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ProfileActions } from '@/features/profile/profile-actions';
import { getInitials } from '@/lib/utils';
import { formatCurrency, formatDate, formatPercent } from '@/lib/format';
import { projectStatusLabels, fundingModelLabels, type ProjectStatus, type FundingModel } from '@/types/enums';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function ProjetoPublicPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: p } = await supabase
    .from('projects')
    .select('*, sport:sports(name), manager:manager_profiles(org_name, profile:profiles(id, full_name))')
    .eq('slug', params.slug)
    .is('deleted_at', null)
    .maybeSingle();

  if (!p) notFound();

  const sport = pickOne<{ name: string }>(p.sport);
  const manager = pickOne<{ org_name: string | null; profile: unknown }>(p.manager);
  const managerProfile = pickOne<{ id: string; full_name: string | null }>(manager?.profile);
  const pct = p.total_cents > 0 ? Math.round((p.raised_cents / p.total_cents) * 100) : 0;
  const saldo = Math.max(0, (p.total_cents ?? 0) - (p.raised_cents ?? 0));

  const { data: linked } = await supabase
    .from('project_athletes')
    .select('athlete:athlete_profiles(slug, profile:profiles(full_name, avatar_url))')
    .eq('project_id', p.id);

  const session = await getSession();
  let favorited = false;
  if (session) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('profile_id', session.userId)
      .eq('target_type', 'project')
      .eq('target_id', p.id)
      .maybeSingle();
    favorited = !!fav;
  }

  return (
    <div className="pb-16">
      <div className="relative h-40 w-full bg-gradient-to-br from-primary/20 to-success/20 md:h-52" />
      <div className="container -mt-10">
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {sport?.name ? <Badge variant="secondary">{sport.name}</Badge> : null}
              <Badge variant="outline">{projectStatusLabels[p.status as ProjectStatus]}</Badge>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold">{p.title}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
              {p.city || p.state ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {[p.city, p.state].filter(Boolean).join('/')}
                </span>
              ) : null}
              {managerProfile?.full_name || manager?.org_name ? (
                <span>por {manager?.org_name ?? managerProfile?.full_name}</span>
              ) : null}
            </p>
          </div>
          <ProfileActions
            targetType="project"
            targetId={p.id as string}
            initialFavorited={favorited}
            isLoggedIn={!!session}
            interestTargetProfileId={managerProfile?.id}
            isSelf={session?.userId === managerProfile?.id}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {p.description ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sobre o projeto</CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-line text-sm text-muted-foreground">
                  {p.description}
                </CardContent>
              </Card>
            ) : null}

            {p.objectives ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-primary" /> Objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-line text-sm text-muted-foreground">
                  {p.objectives}
                </CardContent>
              </Card>
            ) : null}

            {(linked ?? []).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-primary" /> Atletas vinculados
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {(linked ?? []).map((row, i) => {
                    const a = pickOne<{ slug: string | null; profile: unknown }>(row.athlete);
                    const pr = pickOne<{ full_name: string | null; avatar_url: string | null }>(a?.profile);
                    return (
                      <Link
                        key={i}
                        href={a?.slug ? `/atletas/${a.slug}` : '#'}
                        className="flex items-center gap-3 rounded-lg border p-2 transition-colors hover:bg-accent"
                      >
                        <Avatar className="h-9 w-9">
                          {pr?.avatar_url ? <AvatarImage src={pr.avatar_url} alt="" /> : null}
                          <AvatarFallback>{getInitials(pr?.full_name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{pr?.full_name ?? 'Atleta'}</span>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Captação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Progress value={pct} />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Captado</span>
                  <span className="font-semibold">{formatCurrency(p.raised_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meta</span>
                  <span className="font-semibold">{formatCurrency(p.total_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo</span>
                  <span className="font-semibold">{formatCurrency(saldo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Percentual</span>
                  <span className="font-semibold">{formatPercent(pct)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Financiamento</span>
                  <span>{fundingModelLabels[p.funding_model as FundingModel]}</span>
                </div>
                {p.deadline ? (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" /> Prazo
                    </span>
                    <span>{formatDate(p.deadline)}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {p.scope ? <p><span className="text-muted-foreground">Abrangência:</span> {p.scope}</p> : null}
                {p.beneficiaries ? <p><span className="text-muted-foreground">Público:</span> {p.beneficiaries}</p> : null}
                {p.timeline ? <p><span className="text-muted-foreground">Cronograma:</span> {p.timeline}</p> : null}
                {p.process_number ? <p><span className="text-muted-foreground">Processo:</span> {p.process_number}</p> : null}
                {p.has_social_impact ? (
                  <Badge variant="secondary" className="gap-1">
                    <HeartHandshake className="h-3.5 w-3.5" /> Impacto social
                  </Badge>
                ) : null}
              </CardContent>
            </Card>
            <p className="text-center text-xs text-muted-foreground">
              Informações cadastradas pelo usuário podem depender de validação documental.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
