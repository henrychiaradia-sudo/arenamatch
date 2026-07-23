'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { newsletterSchema, type NewsletterInput } from '@/schemas/marketing';
import { subscribeNewsletter } from './actions';

export function NewsletterForm({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  async function onSubmit(values: NewsletterInput) {
    const res = await subscribeNewsletter(values);
    if (!res.ok) {
      toast.error('Não foi possível inscrever', { description: res.error });
      return;
    }
    toast.success('Inscrição confirmada!', {
      description: 'Você receberá novidades do ArenaMatch por e-mail.',
    });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md" noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Seu melhor e-mail"
            aria-label="E-mail para newsletter"
            className={tone === 'dark' ? 'pl-9' : 'bg-background pl-9'}
            {...register('email')}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} variant={tone === 'dark' ? 'secondary' : 'default'}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Inscrever'}
        </Button>
      </div>
      {errors.email ? (
        <p className={`mt-1.5 text-sm ${tone === 'dark' ? 'text-white/80' : 'text-destructive'}`}>
          {errors.email.message}
        </p>
      ) : null}
    </form>
  );
}
