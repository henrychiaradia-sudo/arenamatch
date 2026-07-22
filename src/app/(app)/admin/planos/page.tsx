import { requireAdmin } from '@/lib/auth/session';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PLAN_DEFINITIONS } from '@/config/plans';
import { PLAN_TIERS } from '@/types/enums';
import { formatCurrency } from '@/lib/format';

export default async function AdminPlanosPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="Planos" description="Configuração dos planos (somente leitura no MVP)." />
      <div className="space-y-2">
        {PLAN_TIERS.map((tier) => {
          const plan = PLAN_DEFINITIONS[tier];
          return (
            <Card key={tier}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{plan.name}</p>
                    <Badge variant="secondary">{plan.audience === 'athlete' ? 'Atleta' : 'Empresa'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.priceCents === 0 ? 'Gratuito' : `${formatCurrency(plan.priceCents)}/mês`}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Cand.: {plan.entitlements.maxApplications ?? '∞'} · Oport.:{' '}
                  {plan.entitlements.maxActiveOpportunities ?? '∞'} · Favoritos:{' '}
                  {plan.entitlements.maxFavorites ?? '∞'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
