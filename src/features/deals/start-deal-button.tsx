'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createDeal } from '@/features/deals/actions';

export function StartDealButton({
  athleteProfileId,
  counterpartProfileId,
  athleteName,
}: {
  athleteProfileId: string;
  counterpartProfileId: string;
  athleteName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function onClick() {
    setLoading(true);
    const res = await createDeal({
      title: `Negociação com ${athleteName}`,
      athleteProfileId,
      counterpartProfileId,
    });
    setLoading(false);
    if (!res.ok) return toast.error('Não foi possível', { description: res.error });
    toast.success('Negociação criada no pipeline!');
    if (res.id) router.push(`/painel/pipeline/${res.id}`);
  }

  return (
    <Button onClick={onClick} variant="secondary" disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
      Iniciar negociação
    </Button>
  );
}
