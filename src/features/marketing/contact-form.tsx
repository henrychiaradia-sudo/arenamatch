'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contactSchema, type ContactInput } from '@/schemas/marketing';
import { sendContactMessage } from './actions';

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactInput) {
    const res = await sendContactMessage(values);
    if (!res.ok) {
      toast.error('Não foi possível enviar', { description: res.error });
      return;
    }
    toast.success('Mensagem enviada!', {
      description: 'Recebemos seu contato e retornaremos em breve.',
    });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c-name">Nome</Label>
          <Input id="c-name" placeholder="Seu nome" {...register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-email">E-mail</Label>
          <Input id="c-email" type="email" placeholder="voce@email.com" {...register('email')} />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-subject">Assunto (opcional)</Label>
        <Input id="c-subject" placeholder="Sobre o que você quer falar?" {...register('subject')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-message">Mensagem</Label>
        <Textarea
          id="c-message"
          rows={5}
          placeholder="Escreva sua mensagem..."
          {...register('message')}
        />
        {errors.message ? (
          <p className="text-sm text-destructive">{errors.message.message}</p>
        ) : null}
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Enviar mensagem <Send className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
