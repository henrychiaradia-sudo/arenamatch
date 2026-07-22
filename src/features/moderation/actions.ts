'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';

type Result = { ok: true } | { ok: false; error: string };

/** Solicita verificação do próprio perfil ou de um projeto. */
export async function requestVerification(
  subjectType: 'athlete' | 'company' | 'manager' | 'project',
  subjectId: string,
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();

  const { error } = await supabase.from('verification_requests').insert({
    subject_type: subjectType,
    subject_id: subjectId,
    profile_id: session.userId,
    status: 'under_review',
  });
  if (error) return { ok: false, error: error.message };

  if (subjectType === 'project') {
    await supabase.from('projects').update({ verification_status: 'under_review' }).eq('id', subjectId);
    revalidatePath('/painel/projetos');
  } else {
    await supabase.from('profiles').update({ verification_status: 'under_review' }).eq('id', session.userId);
    revalidatePath('/painel/perfil');
  }
  return { ok: true };
}

/** Registra uma denúncia sobre um usuário/conteúdo. */
export async function reportContent(
  targetType: string,
  targetId: string,
  reason: string,
  description?: string,
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Faça login para denunciar.' };
  if (!reason.trim()) return { ok: false, error: 'Informe o motivo.' };
  const supabase = createClient();
  const { error } = await supabase.from('reports').insert({
    reporter_profile_id: session.userId,
    target_type: targetType,
    target_id: targetId,
    reason: reason.trim(),
    description: description && description !== '' ? description : null,
    status: 'open',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
