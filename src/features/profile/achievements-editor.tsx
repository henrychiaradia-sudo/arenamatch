'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { addAchievement, deleteAchievement } from '@/features/profile/actions';
import { achievementSchema, type AchievementInput } from '@/schemas/profile';

export interface AchievementItem {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
  position: string | null;
}

export function AchievementsEditor({ items }: { items: AchievementItem[] }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AchievementInput>({ resolver: zodResolver(achievementSchema) });

  async function onAdd(values: AchievementInput) {
    const res = await addAchievement(values);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Conquista adicionada!');
    reset({ title: '', description: '', position: '' });
    router.refresh();
  }

  async function onDelete(id: string) {
    const res = await deleteAchievement(id);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState icon={Trophy} title="Nenhuma conquista" description="Adicione seus principais resultados." />
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">
                    {a.title} {a.year ? <span className="text-muted-foreground">· {a.year}</span> : null}
                  </p>
                  {a.position ? <p className="text-sm text-muted-foreground">{a.position}</p> : null}
                  {a.description ? <p className="mt-1 text-sm">{a.description}</p> : null}
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDelete(a.id)} aria-label="Remover">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Adicionar conquista</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onAdd)} className="grid gap-3 sm:grid-cols-2">
            <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
              <Input {...register('title')} placeholder="Ex.: Campeão Brasileiro" />
            </Field>
            <Field label="Ano" error={errors.year?.message}>
              <Input type="number" {...register('year')} />
            </Field>
            <Field label="Colocação" error={errors.position?.message}>
              <Input {...register('position')} placeholder="Ex.: 1º lugar" />
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
