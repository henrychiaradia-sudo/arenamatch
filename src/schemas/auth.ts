import { z } from 'zod';
import { SIGNUP_ROLES } from '@/types/enums';

/** Schemas de validação (cliente + servidor) para autenticação. */

export const signInSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  fullName: z.string().min(3, 'Informe seu nome completo.').max(120),
  email: z.string().email('Informe um e-mail válido.'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .max(72, 'A senha é muito longa.'),
  role: z.enum(SIGNUP_ROLES, {
    errorMap: () => ({ message: 'Selecione o tipo de conta.' }),
  }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'É necessário aceitar os termos e a política de privacidade.' }),
  }),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
