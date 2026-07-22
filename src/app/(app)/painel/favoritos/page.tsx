import Link from 'next/link';
import { Star } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { FavoriteButton } from '@/features/engagement/favorite-button';
import { getInitials } from '@/lib/utils';
import { formatCurrency, formatCurrencyRange } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function FavoritosPage() {
  const session = await requireSession();
  const supabase = createClient();

  const { data: favs } = await supabase
    .from('favorites')
    .select('target_type, target_id')
    .eq('profile_id', session.userId);

  const ids = (type: string) => (favs ?? []).filter((f) => f.target_type === type).map((f) => f.target_id);
  const athleteIds = ids('athlete');
  const companyIds = ids('company');
  const projectIds = ids('project');
  const opportunityIds = ids('opportunity');

  const [athletes, companies, projects, opportunities] = await Promise.all([
    athleteIds.length
      ? supabase.from('athlete_profiles').select('id, slug, city, state, profile:profiles(full_name, avatar_url), sport:sports(name)').in('id', athleteIds)
      : Promise.resolve({ data: [] }),
    companyIds.length
      ? supabase.from('company_profiles').select('id, slug, public_name, legal_name, segment, logo_url').in('id', companyIds)
      : Promise.resolve({ data: [] }),
    projectIds.length
      ? supabase.from('projects').select('id, slug, title, total_cents, raised_cents').in('id', projectIds)
      : Promise.resolve({ data: [] }),
    opportunityIds.length
      ? supabase.from('opportunities').select('id, slug, title, min_investment_cents, max_investment_cents, company:company_profiles(public_name, legal_name)').in('id', opportunityIds)
      : Promise.resolve({ data: [] }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = (athletes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = (companies.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = (projects.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = (opportunities.data ?? []) as any[];

  const total = a.length + c.length + p.length + o.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Favoritos" description="Seus atletas, empresas, projetos e oportunidades salvos." />

      {total === 0 ? (
        <EmptyState icon={Star} title="Nada favoritado" description="Salve perfis e oportunidades para acompanhá-los aqui." />
      ) : (
        <Tabs defaultValue="atletas">
          <TabsList className="flex-wrap">
            <TabsTrigger value="atletas">Atletas ({a.length})</TabsTrigger>
            <TabsTrigger value="empresas">Empresas ({c.length})</TabsTrigger>
            <TabsTrigger value="projetos">Projetos ({p.length})</TabsTrigger>
            <TabsTrigger value="oportunidades">Oportunidades ({o.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="atletas" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {a.map((item) => {
              const pr = pickOne<{ full_name: string | null; avatar_url: string | null }>(item.profile);
              const sport = pickOne<{ name: string }>(item.sport);
              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar>
                      {pr?.avatar_url ? <AvatarImage src={pr.avatar_url} alt="" /> : null}
                      <AvatarFallback>{getInitials(pr?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <Link href={item.slug ? `/atletas/${item.slug}` : '#'} className="truncate font-medium hover:underline">
                        {pr?.full_name ?? 'Atleta'}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {[sport?.name, item.state].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <FavoriteButton targetType="athlete" targetId={item.id} initialFavorited isLoggedIn />
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="empresas" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.map((item) => {
              const name = item.public_name ?? item.legal_name ?? 'Empresa';
              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar className="rounded-lg">
                      {item.logo_url ? <AvatarImage src={item.logo_url} alt="" /> : null}
                      <AvatarFallback className="rounded-lg">{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <Link href={item.slug ? `/empresas/${item.slug}` : '#'} className="truncate font-medium hover:underline">
                        {name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{item.segment}</p>
                    </div>
                    <FavoriteButton targetType="company" targetId={item.id} initialFavorited isLoggedIn />
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="projetos" className="mt-6 grid gap-4 md:grid-cols-2">
            {p.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <Link href={item.slug ? `/projetos/${item.slug}` : '#'} className="font-medium hover:underline">
                      {item.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.raised_cents)} / {formatCurrency(item.total_cents)}
                    </p>
                  </div>
                  <FavoriteButton targetType="project" targetId={item.id} initialFavorited isLoggedIn />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="oportunidades" className="mt-6 grid gap-4 md:grid-cols-2">
            {o.map((item) => {
              const company = pickOne<{ public_name: string | null; legal_name: string | null }>(item.company);
              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <Link href={item.slug ? `/oportunidades/${item.slug}` : '#'} className="font-medium hover:underline">
                        {item.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {company?.public_name ?? company?.legal_name ?? 'Empresa'} ·{' '}
                        {formatCurrencyRange(item.min_investment_cents, item.max_investment_cents)}
                      </p>
                    </div>
                    <FavoriteButton targetType="opportunity" targetId={item.id} initialFavorited isLoggedIn />
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
