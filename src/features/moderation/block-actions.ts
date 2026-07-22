'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

type Result = { ok: true } | { ok: false; error: string };

export async function blockUser(targetProfileId: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  if (targetProfileId === session.userId) return { ok: false, error: 'Ação inválida.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('blocks')
    .upsert(
      { blocker_profile_id: session.userId, blocked_profile_id: targetProfileId },
      { onConflict: 'blocker_profile_id,blocked_profile_id' },
    );
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/mensagens');
  return { ok: true };
}

export async function unblockUser(targetProfileId: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_profile_id', session.userId)
    .eq('blocked_profile_id', targetProfileId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
