'use client';

import * as React from 'react';
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
import { ImageUpload } from '@/features/profile/image-upload';
import { updateAthleteProfile, setAvatar, setCover } from '@/features/profile/actions';
import { athleteProfileSchema, type AthleteProfileInput } from '@/schemas/profile';
import { SPORTS, ATHLETE_CATEGORIES, BRAZIL_STATES } from '@/lib/constants';

interface Props {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  defaults: AthleteProfileInput;
}

export function AthleteProfileForm({ userId, fullName, avatarUrl, coverUrl, defaults }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AthleteProfileInput>({
    resolver: zodResolver(athleteProfileSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: AthleteProfileInput) {
    const res = await updateAthleteProfile(values);
    if (!res.ok) {
      toast.error('Não foi possível salvar', { description: res.error });
      return;
    }
    toast.success('Perfil atualizado!');
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fotos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            userId={userId}
            bucket="covers"
            kind="cover"
            variant="cover"
            currentUrl={coverUrl}
            onSaved={setCover}
          />
          <div className="flex items-center gap-4">
            <ImageUpload
              userId={userId}
              bucket="avatars"
              kind="avatar"
              variant="avatar"
              currentUrl={avatarUrl}
              fallbackText={fullName}
              onSaved={setAvatar}
            />
            <p className="text-sm text-muted-foreground">
              Clique na foto para enviar. Formatos de imagem até 5 MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações esportivas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Modalidade" error={errors.sportSlug?.message}>
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
            <Field label="Categoria" error={errors.category?.message}>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value || ''} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ATHLETE_CATEGORIES.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Cidade" error={errors.city?.message}>
              <Input {...register('city')} />
            </Field>
            <Field label="Estado" error={errors.state?.message}>
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
            <Field label="Equipe / clube" error={errors.team?.message}>
              <Input {...register('team')} />
            </Field>
            <Field label="Federação" error={errors.federation?.message}>
              <Input {...register('federation')} />
            </Field>
            <Field label="Ranking" error={errors.ranking?.message}>
              <Input {...register('ranking')} />
            </Field>
            <Field label="Gênero esportivo (opcional)" error={errors.gender?.message}>
              <Input {...register('gender')} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">História e apresentação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Bio (resumo)" error={errors.bio?.message}>
              <Textarea rows={3} {...register('bio')} />
            </Field>
            <Field label="Sua história" error={errors.story?.message}>
              <Textarea rows={5} {...register('story')} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audiência e captação</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Total de seguidores" error={errors.followersTotal?.message}>
              <Input type="number" min={0} {...register('followersTotal')} />
            </Field>
            <Field label="Taxa de engajamento (%)" error={errors.engagementRate?.message}>
              <Input type="number" step="0.1" min={0} {...register('engagementRate')} />
            </Field>
            <Field label="Necessidade de investimento (R$)" error={errors.investmentNeedReais?.message}>
              <Input type="number" step="0.01" min={0} {...register('investmentNeedReais')} />
            </Field>
            <Field label="Objetivo da captação" error={errors.fundraisingGoal?.message}>
              <Input {...register('fundraisingGoal')} />
            </Field>
            <Field
              label="Tags de público"
              hint="Separadas por vírgula (ex.: jovem, lifestyle)"
              error={errors.audienceTags?.message}
              className="sm:col-span-2"
            >
              <Input {...register('audienceTags')} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferências de patrocínio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <Controller
                control={control}
                name="acceptsDirect"
                render={({ field }) => (
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                )}
              />
              Aceito patrocínio direto
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Controller
                control={control}
                name="acceptsIncentive"
                render={({ field }) => (
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                )}
              />
              Aceito patrocínio incentivado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Controller
                control={control}
                name="availableForCampaigns"
                render={({ field }) => (
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                )}
              />
              Disponível para campanhas
            </label>
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
