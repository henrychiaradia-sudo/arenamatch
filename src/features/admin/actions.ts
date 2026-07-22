'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { notify } from '@/lib/notify';
import type {
  AccountStatus,
  VerificationStatus,
  PlanTier,
  ReportStatus,
} from '@/types/enums';

type Result = { ok: true } | { ok: false; error: string };

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.profile.role !== 'admin') return null;
  return session;
}

async function audit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  const supabase = createClient();
  await supabase.from('audit_logs').insert({
    actor_profile_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
}

export async function setAccountStatus(profileId: string, status: AccountStatus): Promise<Result> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, error: 'Sem permissão.' };
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ account_status: status }).eq('id', profileId);
  if (error) return { ok: false, error: error.message };
  await audit(session.userId, 'account_status_changed', 'profile', profileId, { status });
  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function setVerificationStatus(
  profileId: string,
  status: VerificationStatus,
): Promise<Result> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, error: 'Sem permissão.' };
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ verification_status: status }).eq('id', profileId);
  if (error) return { ok: false, error: error.message };
  await audit(session.userId, 'verification_status_changed', 'profile', profileId, { status });
  if (status === 'verified') {
    await notify(profileId, { type: 'profile_verified', title: 'Perfil verificado', body: 'Seu perfil foi verificado. ✅' });
  }
  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function setUserPlan(profileId: string, planTier: PlanTier): Promise<Result> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, error: 'Sem permissão.' };
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ plan_tier: planTier }).eq('id', profileId);
  if (error) return { ok: false, error: error.message };
  await supabase.from('subscriptions').insert({ profile_id: profileId, plan_tier: planTier, status: 'active' });
  await audit(session.userId, 'plan_changed', 'profile', profileId, { planTier });
  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function reviewVerificationRequest(
  requestId: string,
  approve: boolean,
): Promise<Result> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, error: 'Sem permissão.' };
  const supabase = createClient();

  const { data: req } = await supabase
    .from('verification_requests')
    .select('id, subject_type, subject_id, profile_id')
    .eq('id', requestId)
    .maybeSingle();
  if (!req) return { ok: false, error: 'Solicitação não encontrada.' };

  const newStatus: VerificationStatus = approve ? 'verified' : 'rejected';
  await supabase
    .from('verification_requests')
    .update({ status: newStatus, reviewed_by: session.userId, reviewed_at: new Date().toISOString() })
    .eq('id', requestId);

  // Aplica o status ao sujeito.
  if (req.subject_type === 'project') {
    await supabase.from('projects').update({ verification_status: newStatus }).eq('id', req.subject_id);
  } else {
    await supabase.from('profiles').update({ verification_status: newStatus }).eq('id', req.profile_id);
  }

  await notify(req.profile_id, {
    type: approve ? 'profile_verified' : 'document_rejected',
    title: approve ? 'Verificação aprovada' : 'Verificação rejeitada',
    link: '/painel/perfil',
  });
  await audit(session.userId, 'verification_reviewed', 'verification_request', requestId, { approve });
  revalidatePath('/admin/verificacoes');
  return { ok: true };
}

export async function resolveReport(reportId: string, status: ReportStatus): Promise<Result> {
  const session = await requireAdminSession();
  if (!session) return { ok: false, error: 'Sem permissão.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('reports')
    .update({ status, resolved_by: session.userId, resolved_at: new Date().toISOString() })
    .eq('id', reportId);
  if (error) return { ok: false, error: error.message };
  await audit(session.userId, 'report_resolved', 'report', reportId, { status });
  revalidatePath('/admin/denuncias');
  return { ok: true };
}
