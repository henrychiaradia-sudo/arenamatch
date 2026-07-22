import type { Metadata } from 'next';
import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageIntro } from '@/components/marketing/page-intro';
import { ExploreFilters } from '@/features/explore/explore-filters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { formatCurrency } from '@/lib/format';
import { projectStatusLabels, type ProjectStatus, PROJECT_STATUSES } from '@/types/enums';

export const metadata: Metadata = { title: 'Explorar projetos' };

interface Row {
  id: string;
  slug: string | null;
  title: string;
  city: string | null;
  state: string | null;
  status: ProjectStatus;
  total_cents: number;
  raised_cents: number;
  sport: { name: string | null } | null;
}

export default async function ExplorarProjetosPage({
  searchParams,
}: {
  searchParams: { q?: string; sport?: string; state?: string; status?: string; page?: string };
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
    .from('projects')
    .select('id, slug, title, city, state, status, total_cents, raised_cents, sport:sports(name)', {
      count: 'exact',
    })
    .is('deleted_at', null);

  if (searchParams.state) query = query.eq('state', searchParams.state);
  if (sportId) query = query.eq('sport_id', sportId);
  if (searchParams.status) query = query.eq('status', searchParams.status);

  const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);
  const rows = (data ?? []) as unknown as Row[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  const statusOptions = PROJECT_STATUSES.map((s) => ({ value: s, label: projectStatusLabels[s] }));

  return (
    <>
      <PageIntro
        eyebrow="Descoberta"
        title="Explorar projetos"
        description="Projetos esportivos em captação, por modalidade e região."
      />
      <section className="container space-y-6 py-10">
        <ExploreFilters
          action="/explorar/projetos"
          showSport
          showState
          statusOptions={statusOptions}
          values={searchParams}
        />

        {rows.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Nenhum projeto encontrado"
            description="Ajuste os filtros ou popule o banco com o seed de demonstração para ver exemplos."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => {
              const pct = p.total_cents > 0 ? Math.round((p.raised_cents / p.total_cents) * 100) : 0;
              return (
                <Card key={p.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      {p.sport?.name ? <Badge variant="secondary">{p.sport.name}</Badge> : <span />}
                      <Badge variant="outline">{projectStatusLabels[p.status]}</Badge>
                    </div>
                    <CardTitle className="mt-2 text-lg">
                      <Link href={p.slug ? `/projetos/${p.slug}` : '#'} className="hover:underline">
                        {p.title}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {[p.city, p.state].filter(Boolean).join('/')}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress value={pct} />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(p.raised_cents)} / {formatCurrency(p.total_cents)}
                      </span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} />
      </section>
    </>
  );
}
