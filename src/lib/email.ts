/**
 * Camada de e-mail — PREPARADA para implementação futura.
 *
 * No MVP as notificações são apenas internas (tabela `notifications`). Este
 * módulo define a interface e o ponto de integração para um provedor de e-mail
 * (ex.: Resend, Amazon SES, Postmark) sem enviar nada por padrão.
 *
 * Para ativar no futuro:
 *  1. Definir EMAIL_ENABLED=true e as credenciais do provedor no ambiente.
 *  2. Implementar o envio dentro de `queueEmail`.
 *  3. Chamar `queueEmail` a partir de `src/lib/notify.ts` (buscando o e-mail
 *     do destinatário) ou de um worker que consome as notificações.
 */

export const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';

export interface EmailInput {
  to: string;
  subject: string;
  text: string;
}

/** Enfileira/envia um e-mail. No-op enquanto EMAIL_ENABLED !== 'true'. */
export async function queueEmail(_input: EmailInput): Promise<void> {
  if (!EMAIL_ENABLED) return;
  // TODO: integrar provedor de e-mail (Resend/SES/Postmark).
}
