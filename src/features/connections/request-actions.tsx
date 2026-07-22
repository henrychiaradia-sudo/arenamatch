'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  respondToConnectionRequest,
  cancelConnectionRequest,
} from '@/features/connections/actions';

export function RequestActions({
  requestId,
  mode,
}: {
  requestId: string;
  mode: 'received' | 'sent';
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function respond(accept: boolean) {
    setPending(true);
    const res = await respondToConnectionRequest(requestId, accept);
    setPending(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success(accept ? 'Conexão aceita!' : 'Solicitação recusada');
    router.refresh();
  }

  async function cancel() {
    setPending(true);
    const res = await cancelConnectionRequest(requestId);
    setPending(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Solicitação cancelada');
    router.refresh();
  }

  if (mode === 'sent') {
    return (
      <Button variant="ghost" size="sm" onClick={cancel} disabled={pending}>
        Cancelar
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => respond(true)} disabled={pending}>
        <Check className="h-4 w-4" /> Aceitar
      </Button>
      <Button variant="outline" size="sm" onClick={() => respond(false)} disabled={pending}>
        <X className="h-4 w-4" /> Recusar
      </Button>
    </div>
  );
}
