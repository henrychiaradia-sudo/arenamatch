'use server';

import { createClient } from '@/lib/supabase/server';
import { contactSchema, newsletterSchema } from '@/schemas/marketing';

type Result = { ok: true } | { ok: false; error: string };

/** Registra uma mensagem do formulário público de contato. */
export async function sendContactMessage(input: unknown): Promise<Result> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const { name, email, subject, message } = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('contact_messages').insert({
    name: name.trim(),
    email: email.trim(),
    subject: subject && subject.trim() !== '' ? subject.trim() : null,
    message: message.trim(),
  });
  if (error) return { ok: false, error: 'Não foi possível enviar agora. Tente novamente.' };
  return { ok: true };
}

/** Inscreve um e-mail na newsletter (idempotente). */
export async function subscribeNewsletter(input: unknown): Promise<Result> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'E-mail inválido.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: parsed.data.email.trim() });

  // 23505 = violação de unicidade → já inscrito, tratamos como sucesso.
  if (error && (error as { code?: string }).code !== '23505') {
    return { ok: false, error: 'Não foi possível inscrever agora. Tente novamente.' };
  }
  return { ok: true };
}
