'use client';

import * as React from 'react';
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
import { ImageUpload } from '@/features/profile/image-upload';
import { updateCompanyProfile, setLogo, setCover } from '@/features/profile/actions';
import { SPORTS, BRAZIL_STATES, COMPANY_SEGMENTS, COMPANY_SIZES } from '@/lib/constants';
import { INVESTMENT_MODELS, investmentModelLabels, type InvestmentModel } from '@/types/enums';
import { parseTags } from '@/schemas/profile';

interface Scalars {
  legalName: string;
  publicName: string;
  segment: string;
  size: string;
  city: string;
  state: string;
  website: string;
  description: string;
  investmentModel: InvestmentModel;
  minInvestmentReais?: number;
  maxInvestmentReais?: number;
  objectives: string;
  priorityStates: string;
}

interface Props {
  userId: string;
  companyName: string;
  logoUrl: string | null;
  coverUrl: string | null;
  scalars: Scalars;
  sportsInterest: string[];
}

export function CompanyProfileForm({
  userId,
  companyName,
  logoUrl,
  coverUrl,
  scalars,
  sportsInterest,
}: Props) {
  const [sports, setSports] = React.useState<Set<string>>(new Set(sportsInterest));
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<Scalars>({ defaultValues: scalars });

  function toggleSport(slug: string) {
    setSports((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function onSubmit(v: Scalars) {
    const res = await updateCompanyProfile({
      legalName: v.legalName,
      publicName: v.publicName,
      segment: v.segment,
      size: v.size,
      city: v.city,
      state: v.state,
      description: v.description,
      website: v.website,
      investmentModel: v.investmentModel,
      minInvestmentReais: v.minInvestmentReais,
      maxInvestmentReais: v.maxInvestmentReais,
      objectives: v.objectives,
      priorityStates: parseTags(v.priorityStates).map((s) => s.toUpperCase()).filter((s) => s.length === 2),
      sportsInterest: Array.from(sports),
    });
    if (!res.ok) return toast.error('Não foi possível salvar', { description: res.error });
    toast.success('Perfil atualizado!');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identidade visual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload userId={userId} bucket="covers" kind="cover" variant="cover" currentUrl={coverUrl} onSaved={setCover} />
          <div className="flex items-center gap-4">
            <ImageUpload
              userId={userId}
              bucket="avatars"
              kind="logo"
              variant="avatar"
              currentUrl={logoUrl}
              fallbackText={companyName}
              onSaved={setLogo}
            />
            <p className="text-sm text-muted-foreground">Logo e capa da empresa (até 5 MB).</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados da empresa</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome público">
              <Input {...register('publicName')} />
            </Field>
            <Field label="Razão social">
              <Input {...register('legalName')} />
            </Field>
            <Field label="Segmento">
              <Controller
                control={control}
                name="segment"
                render={({ field }) => (
                  <Select value={field.value || ''} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SEGMENTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Porte">
              <Controller
                control={control}
                name="size"
                render={({ field }) => (
                  <Select value={field.value || ''} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
                          {s.uf} — {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Site" className="sm:col-span-2">
              <Input {...register('website')} placeholder="https://..." />
            </Field>
            <Field label="Descrição institucional" className="sm:col-span-2">
              <Textarea rows={4} {...register('description')} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Objetivos de patrocínio</CardTitle>
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Invest. mínimo (R$)">
                <Input type="number" step="0.01" min={0} {...register('minInvestmentReais')} />
              </Field>
              <Field label="Invest. máximo (R$)">
                <Input type="number" step="0.01" min={0} {...register('maxInvestmentReais')} />
              </Field>
            </div>
            <Field label="Objetivos de marca" hint="Separados por vírgula" className="sm:col-span-2">
              <Input {...register('objectives')} placeholder="jovem, lifestyle, saúde" />
            </Field>
            <Field label="Estados prioritários" hint="UFs separadas por vírgula (ex.: SP, RJ)" className="sm:col-span-2">
              <Input {...register('priorityStates')} placeholder="SP, RJ, MG" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Modalidades de interesse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SPORTS.map((s) => (
                <label key={s.slug} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={sports.has(s.slug)} onCheckedChange={() => toggleSport(s.slug)} />
                  {s.label}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
