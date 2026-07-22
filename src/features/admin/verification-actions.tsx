'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reviewVerificationRequest } from '@/features/admin/actions';

export function VerificationActions({ requestId }: { requestId: string }) {
  const router = useRouter();

  async function review(approve: boolean) {
    const res = await reviewVerificationRequest(requestId, approve);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success(approve ? 'Verificação aprovada' : 'Verificação rejeitada');
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => review(true)}>
        <Check className="h-4 w-4" /> Aprovar
      </Button>
      <Button size="sm" variant="outline" onClick={() => review(false)}>
        <X className="h-4 w-4" /> Rejeitar
      </Button>
    </div>
  );
}
