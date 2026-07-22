'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { notify } from '@/lib/notify';

type Result = { ok: true } | { ok: false; error: string };

export async function sendMessage(conversationId: string, body: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const text = body.trim();
  if (!text) return { ok: false, error: 'Mensagem vazia.' };
  if (text.length > 4000) return { ok: false, error: 'Mensagem muito longa.' };

  const supabase = createClient();

  // Demais membros da conversa.
  const { data: others } = await supabase
    .from('conversation_members')
    .select('profile_id')
    .eq('conversation_id', conversationId)
    .neq('profile_id', session.userId);

  // Bloqueio impede o envio.
  for (const m of others ?? []) {
    const { data: blk } = await supabase.rpc('are_blocked', { p1: session.userId, p2: m.profile_id });
    if (blk) return { ok: false, error: 'Não é possível enviar mensagens para este usuário.' };
  }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_profile_id: session.userId,
    body: text,
  });
  if (error) return { ok: false, error: error.message };

  // Notifica os demais membros.
  for (const m of others ?? []) {
    await notify(m.profile_id, {
      type: 'new_message',
      title: 'Nova mensagem',
      body: `${session.profile.fullName}: ${text.slice(0, 80)}`,
      link: `/painel/mensagens/${conversationId}`,
    });
  }

  revalidatePath(`/painel/mensagens/${conversationId}`);
  revalidatePath('/painel/mensagens');
  return { ok: true };
}

export async function markConversationRead(conversationId: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();

  await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('profile_id', session.userId);

  // Marca como lidas as mensagens recebidas.
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_profile_id', session.userId)
    .is('read_at', null);

  return { ok: true };
}
