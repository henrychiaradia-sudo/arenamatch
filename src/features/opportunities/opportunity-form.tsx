'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
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
import { createOpportunity, updateOpportunity } from '@/features/opportunities/actions';
import { SPORTS, BENEFIT_TYPES } from '@/lib/constants';
import { INVESTMENT_MODELS, investmentModelLabels, type InvestmentModel } from '@/types/enums';
import { parseTags } from '@/schemas/profile';

interface Scalars {
  title: string;
  description: string;
  campaignGoal: string;
  desiredAthleteProfile: string;
  investmentModel: InvestmentModel;
  minInvestmentReais?: number;
  maxInvestmentReais?: number;
  resourceType: string;
  duration: string;
  deadline: string;
  estimatedSlots?: number;
  requirements: string;
  criteria: string;
  regionStates: string;
}

interface Props {
  mode: 'create' | 'edit';
  opportunityId?: string;
  scalars?: Partial<Scalars>;
  desiredBenefits?: string[];
  sportsSlugs?: string[];
}

export function OpportunityForm({ mode, opportunityId, scalars, desiredBenefits, sportsSlugs }: Props) {
  const router = useRouter();
  const [benefits, setBenefits] = React.useState<Set<string>>(new Set(desiredBenefits ?? []));
  const [sports, setSports] = React.useState<Set<string>>(new Set(sportsSlugs ?? []));
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Scalars>({
    defaultValues: { investmentModel: 'both', regionStates: '', ...scalars },
  });

  const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>, slug: string) =>
    set((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  async function onSubmit(v: Scalars) {
    const input = {
      title: v.title,
      description: v.description,
      campaignGoal: v.campaignGoal,
      desiredAthleteProfile: v.desiredAthleteProfile,
      investmentModel: v.investmentModel,
      minInvestmentReais: v.minInvestmentReais,
      maxInvestmentReais: v.maxInvestmentReais,
      resourceType: v.resourceType,
      duration: v.duration,
      deadline: v.deadline,
      estimatedSlots: v.estimatedSlots,
      requirements: v.requirements,
      criteria: v.criteria,
      regionStates: parseTags(v.regionStates).map((s) => s.toUpperCase()).filter((s) => s.length === 2),
      desiredBenefits: Array.from(benefits),
      sportsSlugs: Array.from(sports),
    };
    const res =
      mode === 'create'
        ? await createOpportunity(input)
        : await updateOpportunity(opportunityId!, input);
    if (!res.ok) return toast.error('Não foi possível salvar', { description: res.error });
    toast.success(mode === 'create' ? 'Oportunidade criada!' : 'Oportunidade atualizada!');
    router.push('/painel/oportunidades');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sobre a oportunidade</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
            <Input {...register('title', { required: true })} />
          </Field>
          <Field label="Descrição" className="sm:col-span-2">
            <Textarea rows={4} {...register('description')} />
          </Field>
          <Field label="Objetivo da campanha" className="sm:col-span-2">
            <Input {...register('campaignGoal')} />
          </Field>
          <Field label="Perfil de atleta desejado" className="sm:col-span-2">
            <Textarea rows={2} {...register('desiredAthleteProfile')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Investimento e prazos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Modelo de investimento">
            <Controller
              control={control}
              name="investmentModel"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_MODELS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {investmentModelLabels[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Tipo de recurso">
            <Input {...register('resourceType')} placeholder="Financeiro, produto..." />
          </Field>
          <Field label="Investimento mínimo (R$)">
            <Input type="number" step="0.01" min={0} {...register('minInvestmentReais')} />
          </Field>
          <Field label="Investimento máximo (R$)">
            <Input type="number" step="0.01" min={0} {...register('maxInvestmentReais')} />
          </Field>
          <Field label="Duração">
            <Input {...register('duration')} placeholder="Ex.: 6 meses" />
          </Field>
          <Field label="Prazo para inscrição">
            <Input type="date" {...register('deadline')} />
          </Field>
          <Field label="Vagas estimadas">
            <Input type="number" min={0} {...register('estimatedSlots')} />
          </Field>
          <Field label="Estados (região)" hint="UFs separadas por vírgula">
            <Input {...register('regionStates')} placeholder="SP, RJ" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requisitos e critérios</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Requisitos obrigatórios">
            <Textarea rows={2} {...register('requirements')} />
          </Field>
          <Field label="Critérios de avaliação">
            <Textarea rows={2} {...register('criteria')} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modalidades e contrapartidas desejadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Modalidades</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {SPORTS.map((s) => (
                <label key={s.slug} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={sports.has(s.slug)} onCheckedChange={() => toggle(setSports, s.slug)} />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Contrapartidas desejadas</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {BENEFIT_TYPES.map((b) => (
                <label key={b.slug} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={benefits.has(b.slug)} onCheckedChange={() => toggle(setBenefits, b.slug)} />
                  {b.label}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/painel/oportunidades')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar oportunidade'}
        </Button>
      </div>
    </form>
  );
}
