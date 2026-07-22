import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PlanDefinition } from '@/config/plans';
import type { PlanTier } from '@/types/enums';
import { UpgradeButton } from './upgrade-button';

export function PlansGrid({
  plans,
  currentTier,
  columns = 3,
}: {
  plans: PlanDefinition[];
  currentTier?: PlanTier;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        'grid gap-6',
        columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {plans.map((plan) => {
        const isCurrent = currentTier === plan.tier;
        return (
          <Card
            key={plan.tier}
            className={cn(
              'flex flex-col',
              plan.highlighted && 'border-primary shadow-md ring-1 ring-primary',
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.highlighted ? <Badge>Popular</Badge> : null}
              </div>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-2">
                <span className="font-display text-3xl font-bold">
                  {plan.priceCents === 0 ? 'Gratuito' : formatCurrency(plan.priceCents)}
                </span>
                {plan.priceCents > 0 ? (
                  <span className="text-sm text-muted-foreground"> /mês</span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="mb-6 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <UpgradeButton
                  current={isCurrent}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  label={plan.priceCents === 0 ? 'Começar grátis' : 'Fazer upgrade'}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
