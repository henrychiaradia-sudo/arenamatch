'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function UpgradeButton({
  label = 'Fazer upgrade',
  variant = 'default',
  current = false,
}: {
  label?: string;
  variant?: 'default' | 'outline';
  current?: boolean;
}) {
  if (current) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Plano atual
      </Button>
    );
  }
  return (
    <Button
      variant={variant}
      className="w-full"
      onClick={() =>
        toast.info('Pagamentos ainda não estão ativos', {
          description:
            'Neste MVP os planos são demonstrativos. Em breve será possível contratar e gerenciar assinaturas.',
        })
      }
    >
      {label}
    </Button>
  );
}
