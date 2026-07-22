import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { DealStatusSelect } from '@/features/deals/deal-status-select';
import { formatCurrency } from '@/lib/format';
import { DEAL_PIPELINE_COLUMNS, dealStatusLabels, type DealStatus } from '@/types/enums';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function PipelinePage() {
  const session = await requireRole('company');
  const supabase = createClient();

  const { data: company } = await supabase
    .from('company_profiles')
    .select('id')
    .eq('profile_id', session.userId)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let deals: any[] = [];
  if (company) {
    const { data } = await supabase
      .from('deals')
      .select('id, title, status, estimated_value_cents, next_step, counterpart:profiles!counterpart_profile_id(full_name)')
      .eq('company_profile_id', company.id)
      .order('created_at', { ascending: false });
    deals = data ?? [];
  }

  const totalValue = deals
    .filter((d) => !['closed_lost'].includes(d.status))
    .reduce((sum, d) => sum + (d.estimated_value_cents ?? 0), 0);

  const byStatus: Record<string, typeof deals> = {};
  for (const s of DEAL_PIPELINE_COLUMNS) byStatus[s] = [];
  for (const d of deals) (byStatus[d.status] ??= []).push(d);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        description={`${deals.length} negociação(ões) · ${formatCurrency(totalValue)} em jogo`}
      />

      {deals.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Nenhuma negociação"
          description="Inicie uma negociação a partir do perfil de um atleta para acompanhá-la aqui."
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {DEAL_PIPELINE_COLUMNS.map((status) => (
            <div key={status} className="w-72 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{dealStatusLabels[status as DealStatus]}</span>
                <span className="text-xs text-muted-foreground">{byStatus[status]?.length ?? 0}</span>
              </div>
              <div className="space-y-2 rounded-lg bg-muted/40 p-2">
                {(byStatus[status] ?? []).map((d) => {
                  const counterpart = pickOne<{ full_name: string | null }>(d.counterpart);
                  return (
                    <Card key={d.id}>
                      <CardContent className="space-y-2 p-3">
                        <Link href={`/painel/pipeline/${d.id}`} className="block text-sm font-medium hover:underline">
                          {d.title}
                        </Link>
                        {counterpart?.full_name ? (
                          <p className="text-xs text-muted-foreground">{counterpart.full_name}</p>
                        ) : null}
                        {d.estimated_value_cents ? (
                          <p className="text-sm font-semibold">{formatCurrency(d.estimated_value_cents)}</p>
                        ) : null}
                        {d.next_step ? (
                          <p className="text-xs text-muted-foreground">Próximo: {d.next_step}</p>
                        ) : null}
                        <DealStatusSelect id={d.id} status={d.status as DealStatus} />
                      </CardContent>
                    </Card>
                  );
                })}
                {(byStatus[status] ?? []).length === 0 ? (
                  <p className="px-1 py-2 text-xs text-muted-foreground">—</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
