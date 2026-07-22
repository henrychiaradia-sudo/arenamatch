'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateManagerProfile } from '@/features/profile/actions';
import { managerProfileSchema, type ManagerProfileInput } from '@/schemas/profile';

export function ManagerProfileForm({ defaults }: { defaults: ManagerProfileInput }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ManagerProfileInput>({
    resolver: zodResolver(managerProfileSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: ManagerProfileInput) {
    const res = await updateManagerProfile(values);
    if (!res.ok) return toast.error('Não foi possível salvar', { description: res.error });
    toast.success('Perfil atualizado!');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do gestor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <Controller
              control={control}
              name="isOrganization"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
              )}
            />
            Represento uma organização / instituição
          </label>
          <Field label="Nome da organização" error={errors.orgName?.message}>
            <Input {...register('orgName')} />
          </Field>
          <Field label="Áreas de atuação" hint="Separadas por vírgula" error={errors.areas?.message}>
            <Input {...register('areas')} placeholder="Formação de base, Paradesporto" />
          </Field>
          <Field label="Experiência" error={errors.experience?.message}>
            <Textarea rows={5} {...register('experience')} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
