'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateOpportunityStatus, deleteOpportunity } from '@/features/opportunities/actions';
import { OPPORTUNITY_STATUSES, opportunityStatusLabels, type OpportunityStatus } from '@/types/enums';

export function OpportunityRowActions({ id, status }: { id: string; status: OpportunityStatus }) {
  const router = useRouter();

  async function onStatus(value: string) {
    const res = await updateOpportunityStatus(id, value as OpportunityStatus);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Status atualizado');
    router.refresh();
  }

  async function onDelete() {
    const res = await deleteOpportunity(id);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Oportunidade excluída');
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={onStatus}>
        <SelectTrigger className="h-9 w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPPORTUNITY_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {opportunityStatusLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button asChild variant="outline" size="icon" aria-label="Editar">
        <Link href={`/painel/oportunidades/${id}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
