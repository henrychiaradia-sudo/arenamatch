'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/form-field';
import { updateDeal, deleteDeal } from '@/features/deals/actions';

interface Props {
  id: string;
  estimatedValueReais?: number;
  nextStep: string;
  nextContactOn: string;
}

export function DealDetailForm({ id, estimatedValueReais, nextStep, nextContactOn }: Props) {
  const router = useRouter();
  const [value, setValue] = React.useState(estimatedValueReais?.toString() ?? '');
  const [step, setStep] = React.useState(nextStep);
  const [date, setDate] = React.useState(nextContactOn);
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    const res = await updateDeal(id, {
      estimatedValueReais: value === '' ? undefined : Number(value),
      nextStep: step,
      nextContactOn: date,
    });
    setSaving(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Negociação atualizada');
    router.refresh();
  }

  async function remove() {
    const res = await deleteDeal(id);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Negociação excluída');
    router.push('/painel/pipeline');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Valor estimado (R$)">
          <Input type="number" step="0.01" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label="Próximo passo">
          <Input value={step} onChange={(e) => setStep(e.target.value)} />
        </Field>
        <Field label="Data do próximo contato">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={remove} className="text-destructive">
          <Trash2 className="h-4 w-4" /> Excluir
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
