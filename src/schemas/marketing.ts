import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Informe seu nome.').max(120, 'Nome muito longo.'),
  email: z.string().email('E-mail inválido.'),
  subject: z.string().max(160, 'Assunto muito longo.').optional().or(z.literal('')),
  message: z
    .string()
    .min(10, 'Escreva uma mensagem com pelo menos 10 caracteres.')
    .max(2000, 'Mensagem muito longa.'),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().email('E-mail inválido.'),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;
