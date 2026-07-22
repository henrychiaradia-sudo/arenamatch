import Link from 'next/link';
import { Megaphone, Plus } from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { OpportunityRowActions } from '@/features/opportunities/opportunity-row-actions';
import { formatCurrencyRange, formatDate } from '@/lib/format';
import { opportunityStatusLabels, type OpportunityStatus } from '@/types/enums';

export default async function OportunidadesPage() {
  const session = await requireRole('company');
  const supabase = createClient();

  const { data: company } = await supabase
    .from('company_profiles')
    .select('id')
    .eq('profile_id', session.userId)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rows: any[] = [];
  if (company) {
    const { data } = await supabase
      .from('opportunities')
      .select('id, title, status, min_investment_cents, max_investment_cents, deadline, applications(count)')
      .eq('company_profile_id', company.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    rows = data ?? [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas oportunidades"
        description="Publique e gerencie oportunidades de patrocínio."
        actions={
          <Button asChild>
            <Link href="/painel/oportunidades/nova">
              <Plus className="h-4 w-4" /> Nova oportunidade
            </Link>
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhuma oportunidade"
          description="Crie sua primeira oportunidade de patrocínio."
          action={
            <Button asChild>
              <Link href="/painel/oportunidades/nova">Criar oportunidade</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((o) => {
            const applicationsCount = o.applications?.[0]?.count ?? 0;
            return (
              <Card key={o.id}>
                <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{o.title}</p>
                      <Badge variant="outline">
                        {opportunityStatusLabels[o.status as OpportunityStatus]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatCurrencyRange(o.min_investment_cents, o.max_investment_cents)}
                      {o.deadline ? ` · inscrições até ${formatDate(o.deadline)}` : ''} · {applicationsCount}{' '}
                      candidatura(s)
                    </p>
                  </div>
                  <OpportunityRowActions id={o.id} status={o.status as OpportunityStatus} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
