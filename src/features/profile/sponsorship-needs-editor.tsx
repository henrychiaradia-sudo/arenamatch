'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Trash2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { addSponsorshipNeed, deleteSponsorshipNeed } from '@/features/profile/actions';
import { sponsorshipNeedSchema, type SponsorshipNeedInput } from '@/schemas/profile';
import { formatCurrency } from '@/lib/format';

export interface NeedItem {
  id: string;
  title: string;
  description: string | null;
  amount_cents: number | null;
}

export function SponsorshipNeedsEditor({ items }: { items: NeedItem[] }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SponsorshipNeedInput>({ resolver: zodResolver(sponsorshipNeedSchema) });

  async function onAdd(values: SponsorshipNeedInput) {
    const res = await addSponsorshipNeed(values);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Necessidade adicionada!');
    reset({ title: '', description: '' });
    router.refresh();
  }

  async function onDelete(id: string) {
    const res = await deleteSponsorshipNeed(id);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState icon={Target} title="Nenhuma necessidade" description="Detalhe o que você precisa captar." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {n.title}
                    {n.amount_cents ? (
                      <span className="text-muted-foreground"> · {formatCurrency(n.amount_cents)}</span>
                    ) : null}
                  </p>
                  {n.description ? <p className="mt-1 text-sm">{n.description}</p> : null}
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDelete(n.id)} aria-label="Remover">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Adicionar necessidade</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onAdd)} className="grid gap-3 sm:grid-cols-2">
            <Field label="Título" error={errors.title?.message}>
              <Input {...register('title')} placeholder="Ex.: Equipamentos" />
            </Field>
            <Field label="Valor (R$)" error={errors.amountReais?.message}>
              <Input type="number" step="0.01" min={0} {...register('amountReais')} />
            </Field>
            <Field label="Descrição" error={errors.description?.message} className="sm:col-span-2">
              <Textarea rows={2} {...register('description')} />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm" disabled={isSubmitting}>
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
