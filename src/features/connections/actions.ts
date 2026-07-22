'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { notify } from '@/lib/notify';

type Result = { ok: true } | { ok: false; error: string };

export async function sendConnectionRequest(
  targetProfileId: string,
  opts?: { contextType?: string; contextId?: string; message?: string },
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Faça login para demonstrar interesse.' };
  const me = session.userId;
  if (targetProfileId === me) return { ok: false, error: 'Ação inválida.' };

  const supabase = createClient();

  const { data: blocked } = await supabase.rpc('are_blocked', { p1: me, p2: targetProfileId });
  if (blocked) return { ok: false, error: 'Não é possível conectar com este usuário.' };

  const { data: connected } = await supabase.rpc('are_connected', { p1: me, p2: targetProfileId });
  if (connected) return { ok: false, error: 'Vocês já estão conectados.' };

  const { data: existing } = await supabase
    .from('connection_requests')
    .select('id')
    .or(
      `and(requester_profile_id.eq.${me},target_profile_id.eq.${targetProfileId}),and(requester_profile_id.eq.${targetProfileId},target_profile_id.eq.${me})`,
    )
    .eq('status', 'pending')
    .maybeSingle();
  if (existing) return { ok: false, error: 'Já existe uma solicitação pendente.' };

  const { error } = await supabase.from('connection_requests').insert({
    requester_profile_id: me,
    target_profile_id: targetProfileId,
    context_type: opts?.contextType ?? null,
    context_id: opts?.contextId ?? null,
    message: opts?.message ?? null,
    status: 'pending',
  });
  if (error) return { ok: false, error: error.message };

  await notify(targetProfileId, {
    type: 'new_interest',
    title: 'Novo interesse',
    body: `${session.profile.fullName} demonstrou interesse em conectar.`,
    link: '/painel/conexoes',
  });
  revalidatePath('/painel/conexoes');
  return { ok: true };
}

export async function respondToConnectionRequest(
  requestId: string,
  accept: boolean,
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();

  const { data: req } = await supabase
    .from('connection_requests')
    .select('id, requester_profile_id, target_profile_id, status')
    .eq('id', requestId)
    .maybeSingle();
  if (!req) return { ok: false, error: 'Solicitação não encontrada.' };
  if (req.target_profile_id !== session.userId) return { ok: false, error: 'Sem permissão.' };

  if (!accept) {
    await supabase.from('connection_requests').update({ status: 'declined' }).eq('id', requestId);
    await notify(req.requester_profile_id, {
      type: 'interest_declined',
      title: 'Interesse recusado',
      link: '/painel/conexoes',
    });
    revalidatePath('/painel/conexoes');
    return { ok: true };
  }

  await supabase.from('connection_requests').update({ status: 'accepted' }).eq('id', requestId);

  const a = req.requester_profile_id < req.target_profile_id ? req.requester_profile_id : req.target_profile_id;
  const b = req.requester_profile_id < req.target_profile_id ? req.target_profile_id : req.requester_profile_id;
  await supabase
    .from('connections')
    .upsert({ profile_a: a, profile_b: b, request_id: requestId }, { onConflict: 'profile_a,profile_b' });

  // Cria a conversa (id explícito evita insert vazio).
  const convId = crypto.randomUUID();
  const { error: convErr } = await supabase.from('conversations').insert({ id: convId });
  if (!convErr) {
    // Insere o próprio membro primeiro (satisfaz a RLS) e depois o outro.
    await supabase.from('conversation_members').insert({ conversation_id: convId, profile_id: session.userId });
    await supabase.from('conversation_members').insert({ conversation_id: convId, profile_id: req.requester_profile_id });
  }

  await notify(req.requester_profile_id, {
    type: 'interest_accepted',
    title: 'Interesse aceito',
    body: `${session.profile.fullName} aceitou sua conexão. Vocês já podem conversar.`,
    link: '/painel/mensagens',
  });
  revalidatePath('/painel/conexoes');
  revalidatePath('/painel/mensagens');
  return { ok: true };
}

export async function cancelConnectionRequest(requestId: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('connection_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .eq('requester_profile_id', session.userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/conexoes');
  return { ok: true };
}
