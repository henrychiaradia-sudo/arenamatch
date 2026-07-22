'use client';

import { useRouter } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createProject, updateProject } from '@/features/projects/actions';
import { projectSchema, type ProjectInput } from '@/schemas/project';
import { SPORTS, BRAZIL_STATES } from '@/lib/constants';
import { FUNDING_MODELS, fundingModelLabels } from '@/types/enums';

interface Props {
  mode: 'create' | 'edit';
  projectId?: string;
  defaults?: Partial<ProjectInput>;
}

export function ProjectForm({ mode, projectId, defaults }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: { fundingModel: 'incentive', hasSocialImpact: true, ...defaults },
  });

  async function onSubmit(values: ProjectInput) {
    const res =
      mode === 'create' ? await createProject(values) : await updateProject(projectId!, values);
    if (!res.ok) return toast.error('Não foi possível salvar', { description: res.error });
    toast.success(mode === 'create' ? 'Projeto criado!' : 'Projeto atualizado!');
    router.push('/painel/projetos');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do projeto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
            <Input {...register('title')} />
          </Field>
          <Field label="Descrição" error={errors.description?.message} className="sm:col-span-2">
            <Textarea rows={4} {...register('description')} />
          </Field>
          <Field label="Modalidade">
            <Controller
              control={control}
              name="sportSlug"
              render={({ field }) => (
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS.map((s) => (
                      <SelectItem key={s.slug} value={s.slug}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Categoria / público">
            <Input {...register('category')} placeholder="Ex.: Base, comunitário" />
          </Field>
          <Field label="Cidade">
            <Input {...register('city')} />
          </Field>
          <Field label="Estado">
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZIL_STATES.map((s) => (
                      <SelectItem key={s.uf} value={s.uf}>
                        {s.uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Abrangência">
            <Input {...register('scope')} placeholder="Municipal, estadual..." />
          </Field>
          <Field label="Público beneficiado">
            <Input {...register('beneficiaries')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Captação e cronograma</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor total (R$)" error={errors.totalReais?.message}>
            <Input type="number" step="0.01" min={0} {...register('totalReais')} />
          </Field>
          <Field label="Modelo de financiamento">
            <Controller
              control={control}
              name="fundingModel"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNDING_MODELS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {fundingModelLabels[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Prazo de captação">
            <Input type="date" {...register('deadline')} />
          </Field>
          <Field label="Número do processo (se aplicável)">
            <Input {...register('processNumber')} />
          </Field>
          <Field label="Cronograma" className="sm:col-span-2">
            <Input {...register('timeline')} placeholder="Ex.: 12 meses" />
          </Field>
          <Field label="Objetivos" className="sm:col-span-2">
            <Textarea rows={3} {...register('objectives')} />
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <Controller
              control={control}
              name="hasSocialImpact"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
              )}
            />
            Projeto com impacto social
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/painel/projetos')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar projeto'}
        </Button>
      </div>
    </form>
  );
}
