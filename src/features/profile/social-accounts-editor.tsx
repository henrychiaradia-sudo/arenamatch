'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { upsertSocialAccount, deleteSocialAccount } from '@/features/profile/actions';
import { socialAccountSchema, type SocialAccountInput } from '@/schemas/profile';
import { formatCompactNumber } from '@/lib/format';

export interface SocialItem {
  id: string;
  platform: string;
  handle: string | null;
  url: string | null;
  followers: number | null;
}

export function SocialAccountsEditor({ items }: { items: SocialItem[] }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SocialAccountInput>({ resolver: zodResolver(socialAccountSchema) });

  async function onAdd(values: SocialAccountInput) {
    const res = await upsertSocialAccount(values);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Rede social salva!');
    reset({ platform: '', handle: '', url: '' });
    router.refresh();
  }

  async function onDelete(id: string) {
    const res = await deleteSocialAccount(id);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState icon={Share2} title="Nenhuma rede" description="Adicione suas redes sociais e audiência." />
      ) : (
        <div className="space-y-2">
          {items.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{s.platform}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.handle} {s.followers ? `· ${formatCompactNumber(s.followers)} seguidores` : ''}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDelete(s.id)} aria-label="Remover">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Adicionar rede social</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onAdd)} className="grid gap-3 sm:grid-cols-2">
            <Field label="Rede" error={errors.platform?.message}>
              <Input {...register('platform')} placeholder="Instagram, TikTok, YouTube..." />
            </Field>
            <Field label="@ / usuário" error={errors.handle?.message}>
              <Input {...register('handle')} placeholder="@seuperfil" />
            </Field>
            <Field label="URL" error={errors.url?.message}>
              <Input {...register('url')} placeholder="https://..." />
            </Field>
            <Field label="Seguidores" error={errors.followers?.message}>
              <Input type="number" min={0} {...register('followers')} />
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
