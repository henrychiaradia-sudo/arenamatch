import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageIntro } from '@/components/marketing/page-intro';
import { ExploreFilters } from '@/features/explore/explore-filters';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { getInitials } from '@/lib/utils';
import { investmentModelLabels, type InvestmentModel } from '@/types/enums';

export const metadata: Metadata = { title: 'Explorar empresas' };

interface Row {
  id: string;
  slug: string | null;
  public_name: string | null;
  legal_name: string | null;
  segment: string | null;
  city: string | null;
  state: string | null;
  logo_url: string | null;
  investment_model: InvestmentModel;
}

export default async function ExplorarEmpresasPage({
  searchParams,
}: {
  searchParams: { q?: string; state?: string; page?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('company_profiles')
    .select('id, slug, public_name, legal_name, segment, city, state, logo_url, investment_model', {
      count: 'exact',
    })
    .is('deleted_at', null);

  if (searchParams.state) query = query.eq('state', searchParams.state);

  const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);
  const rows = (data ?? []) as unknown as Row[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <>
      <PageIntro
        eyebrow="Descoberta"
        title="Explorar empresas"
        description="Empresas abertas a patrocinar atletas e projetos."
      />
      <section className="container space-y-6 py-10">
        <ExploreFilters action="/explorar/empresas" showState values={searchParams} />

        {rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Nenhuma empresa encontrada"
            description="Ajuste os filtros ou popule o banco com o seed de demonstração para ver exemplos."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((c) => {
              const name = c.public_name ?? c.legal_name ?? 'Empresa';
              return (
                <Card key={c.id}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <Avatar className="h-12 w-12 rounded-lg">
                      {c.logo_url ? <AvatarImage src={c.logo_url} alt={name} /> : null}
                      <AvatarFallback className="rounded-lg">{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">
                        <Link href={c.slug ? `/empresas/${c.slug}` : '#'} className="hover:underline">
                          {name}
                        </Link>
                      </h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {[c.segment, c.state].filter(Boolean).join(' · ')}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {investmentModelLabels[c.investment_model]}
                      </Badge>
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
