'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Trophy, Building2, FolderKanban, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { appConfig } from '@/config/app';
import { signUpSchema, type SignUpInput } from '@/schemas/auth';
import type { SignupRole } from '@/types/enums';
import { cn } from '@/lib/utils';

const roleOptions: { value: SignupRole; label: string; description: string; icon: typeof Trophy }[] =
  [
    { value: 'athlete', label: 'Sou atleta', description: 'Busco patrocínio', icon: Trophy },
    { value: 'company', label: 'Represento uma empresa', description: 'Quero patrocinar', icon: Building2 },
    { value: 'manager', label: 'Sou gestor de projeto', description: 'Gerencio projetos', icon: FolderKanban },
  ];

export function SignupForm() {
  const router = useRouter();
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: 'athlete', acceptTerms: false as unknown as true },
  });

  async function onSubmit(values: SignUpInput) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName, role: values.role },
        emailRedirectTo: `${appConfig.url}/auth/callback`,
      },
    });

    if (error) {
      toast.error('Não foi possível criar a conta', { description: error.message });
      return;
    }

    // Se a confirmação de e-mail estiver desativada, já vem sessão.
    if (data.session) {
      toast.success('Conta criada!');
      router.push('/onboarding');
      router.refresh();
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
          <h2 className="text-xl font-semibold">Confirme seu e-mail</h2>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação. Verifique sua caixa de entrada para ativar a conta.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/entrar">Ir para o login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Criar conta</CardTitle>
        <CardDescription>Comece gratuitamente no {appConfig.name}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label>Tipo de conta</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div className="grid gap-2">
                  {roleOptions.map((opt) => {
                    const active = field.value === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                          active
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'hover:bg-accent',
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-9 w-9 place-items-center rounded-md',
                            active ? 'bg-primary text-primary-foreground' : 'bg-muted',
                          )}
                        >
                          <opt.icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{opt.label}</span>
                          <span className="block text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.role ? <p className="text-sm text-destructive">{errors.role.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" autoComplete="name" {...register('fullName')} />
            {errors.fullName ? (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="flex items-start gap-2">
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field }) => (
                <Checkbox
                  id="acceptTerms"
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                  className="mt-0.5"
                />
              )}
            />
            <Label htmlFor="acceptTerms" className="text-xs font-normal leading-snug text-muted-foreground">
              Li e aceito os{' '}
              <Link href="/termos" className="text-primary hover:underline">
                Termos de uso
              </Link>{' '}
              e a{' '}
              <Link href="/privacidade" className="text-primary hover:underline">
                Política de privacidade
              </Link>
              .
            </Label>
          </div>
          {errors.acceptTerms ? (
            <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta gratuita'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/entrar" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
