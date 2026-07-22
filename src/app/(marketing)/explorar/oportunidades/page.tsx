import type { Metadata } from 'next';
import Link from 'next/link';
import { Megaphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageIntro } from '@/components/marketing/page-intro';
import { ExploreFilters } from '@/features/explore/explore-filters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { formatCurrencyRange, formatDate } from '@/lib/format';
import { investmentModelLabels, type InvestmentModel } from '@/types/enums';

export const metadata: Metadata = { title: 'Explorar oportunidades' };

interface Row {
  id: string;
  slug: string | null;
  title: string;
  investment_model: InvestmentModel;
  min_investment_cents: number | null;
  max_investment_cents: number | null;
  deadline: string | null;
  company: { public_name: string | null; legal_name: string | null } | null;
}

export default async function ExplorarOportunidadesPage({
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
    .from('opportunities')
    .select(
      'id, slug, title, investment_model, min_investment_cents, max_investment_cents, deadline, company:company_profiles(public_name, legal_name)',
      { count: 'exact' },
    )
    .eq('status', 'open')
    .is('deleted_at', null);

  if (searchParams.state) query = query.contains('region_states', [searchParams.state]);

  const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);
  const rows = (data ?? []) as unknown as Row[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <>
      <PageIntro
        eyebrow="Descoberta"
        title="Explorar oportunidades"
        description="Oportunidades de patrocínio abertas por empresas."
      />
      <section className="container space-y-6 py-10">
        <ExploreFilters action="/explorar/oportunidades" showState values={searchParams} />

        {rows.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Nenhuma oportunidade aberta"
            description="Volte em breve ou popule o banco com o seed de demonstração para ver exemplos."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((o) => (
              <Card key={o.id}>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    {investmentModelLabels[o.investment_model]}
                  </Badge>
                  <CardTitle className="mt-2 text-lg">
                    <Link href={o.slug ? `/oportunidades/${o.slug}` : '#'} className="hover:underline">
                      {o.title}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {o.company?.public_name ?? o.company?.legal_name ?? 'Empresa'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="font-medium">
                    {formatCurrencyRange(o.min_investment_cents, o.max_investment_cents)}
                  </p>
                  {o.deadline ? (
                    <p className="text-muted-foreground">Inscrições até {formatDate(o.deadline)}</p>
                  ) : null}
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
