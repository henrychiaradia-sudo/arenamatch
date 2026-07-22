'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

type Result = { ok: true } | { ok: false; error: string };

export async function markNotificationRead(id: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('profile_id', session.userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/notificacoes');
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('profile_id', session.userId)
    .is('read_at', null);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/notificacoes');
  return { ok: true };
}
