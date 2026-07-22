'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updateApplicationStatus } from '@/features/opportunities/actions';

export function WithdrawButton({ id }: { id: string }) {
  const router = useRouter();
  async function onClick() {
    const res = await updateApplicationStatus(id, 'withdrawn');
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Candidatura retirada');
    router.refresh();
  }
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      Retirar
    </Button>
  );
}
