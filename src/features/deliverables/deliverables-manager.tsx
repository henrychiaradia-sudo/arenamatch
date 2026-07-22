'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/form-field';
import { addDeliverable } from '@/features/deliverables/actions';
import { DeliverableRow, type DeliverableData } from '@/features/deliverables/deliverable-row';

export function DeliverablesManager({ dealId, items }: { dealId: string; items: DeliverableData[] }) {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  async function onAdd() {
    if (!title.trim()) return;
    setSaving(true);
    const res = await addDeliverable(dealId, { title, description, dueDate });
    setSaving(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    setTitle('');
    setDescription('');
    setDueDate('');
    toast.success('Contrapartida adicionada');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-4">
        <Field label="Título" className="sm:col-span-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Post de anúncio" />
        </Field>
        <Field label="Prazo">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <div className="flex items-end">
          <Button onClick={onAdd} disabled={saving || !title.trim()} className="w-full">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
        <Field label="Descrição" className="sm:col-span-4">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma contrapartida ainda.</p>
      ) : (
        <div className="space-y-2">
          {items.map((d) => (
            <DeliverableRow key={d.id} item={d} canDelete />
          ))}
        </div>
      )}
    </div>
  );
}
