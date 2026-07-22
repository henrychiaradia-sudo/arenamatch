'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blockUser, unblockUser } from '@/features/moderation/block-actions';

export function BlockButton({
  targetProfileId,
  initialBlocked,
}: {
  targetProfileId: string;
  initialBlocked: boolean;
}) {
  const router = useRouter();
  const [blocked, setBlocked] = React.useState(initialBlocked);
  const [pending, setPending] = React.useState(false);

  async function onClick() {
    setPending(true);
    const res = blocked ? await unblockUser(targetProfileId) : await blockUser(targetProfileId);
    setPending(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    setBlocked(!blocked);
    toast.success(blocked ? 'Usuário desbloqueado' : 'Usuário bloqueado');
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onClick} disabled={pending}>
      <Ban className="h-4 w-4" /> {blocked ? 'Desbloquear' : 'Bloquear'}
    </Button>
  );
}
