import { createClient } from '@/lib/supabase/server';
import type { NotificationType } from '@/types/enums';

/**
 * Cria uma notificação para um usuário via função SECURITY DEFINER
 * (`create_notification`), permitindo notificar terceiros a partir de fluxos
 * controlados do servidor sem afrouxar a RLS da tabela `notifications`.
 * Silencioso em caso de erro para não quebrar a ação principal.
 */
export async function notify(
  profileId: string,
  input: { type: NotificationType; title: string; body?: string; link?: string },
): Promise<void> {
  const supabase = createClient();
  await supabase.rpc('create_notification', {
    target: profileId,
    ntype: input.type,
    ntitle: input.title,
    nbody: input.body ?? null,
    nlink: input.link ?? null,
  });
}
