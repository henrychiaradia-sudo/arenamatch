'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateDealStatus } from '@/features/deals/actions';
import { DEAL_PIPELINE_COLUMNS, dealStatusLabels, type DealStatus } from '@/types/enums';

export function DealStatusSelect({ id, status }: { id: string; status: DealStatus }) {
  const router = useRouter();
  async function onChange(value: string) {
    const res = await updateDealStatus(id, value as DealStatus);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Negociação movida');
    router.refresh();
  }
  return (
    <Select value={status} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DEAL_PIPELINE_COLUMNS.map((s) => (
          <SelectItem key={s} value={s}>
            {dealStatusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
