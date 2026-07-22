'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BadgeCheck, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { requestVerification } from '@/features/moderation/actions';
import type { VerificationStatus } from '@/types/enums';

export function VerifyButton({
  subjectType,
  subjectId,
  currentStatus,
}: {
  subjectType: 'athlete' | 'company' | 'manager' | 'project';
  subjectId: string;
  currentStatus: VerificationStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  if (currentStatus === 'verified') {
    return (
      <Badge className="gap-1">
        <BadgeCheck className="h-3.5 w-3.5" /> Verificado
      </Badge>
    );
  }
  if (currentStatus === 'under_review') {
    return <Badge variant="secondary">Verificação em análise</Badge>;
  }

  async function onClick() {
    setLoading(true);
    const res = await requestVerification(subjectType, subjectId);
    setLoading(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Verificação solicitada!', { description: 'Nossa equipe irá analisar.' });
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
      Solicitar verificação
    </Button>
  );
}
