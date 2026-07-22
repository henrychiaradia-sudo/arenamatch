'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { appConfig } from '@/config/app';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth';

export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${appConfig.url}/redefinir-senha`,
    });
    // Sempre mostramos sucesso (evita enumeração de e-mails).
    setSent(true);
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <MailCheck className="h-12 w-12 text-success" />
          <h2 className="text-xl font-semibold">Verifique seu e-mail</h2>
          <p className="text-sm text-muted-foreground">
            Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/entrar">Voltar ao login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recuperar senha</CardTitle>
        <CardDescription>Enviaremos um link para redefinir sua senha.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
