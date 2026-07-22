'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { notify } from '@/lib/notify';
import type { DeliverableStatus } from '@/types/enums';

type Result = { ok: true } | { ok: false; error: string };

const nn = (v: string | undefined | null) => (v == null || v === '' ? null : v);

export async function addDeliverable(
  dealId: string,
  input: { title: string; description?: string; dueDate?: string },
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  if (!input.title.trim()) return { ok: false, error: 'Informe o título.' };
  const supabase = createClient();

  const { data: deal } = await supabase
    .from('deals')
    .select('counterpart_profile_id')
    .eq('id', dealId)
    .maybeSingle();

  const { error } = await supabase.from('deliverables').insert({
    deal_id: dealId,
    title: input.title.trim(),
    description: nn(input.description),
    due_date: nn(input.dueDate),
    responsible_profile_id: deal?.counterpart_profile_id ?? null,
    status: 'planned',
  });
  if (error) return { ok: false, error: error.message };

  if (deal?.counterpart_profile_id) {
    await notify(deal.counterpart_profile_id, {
      type: 'status_changed',
      title: 'Nova contrapartida',
      body: `Contrapartida "${input.title.trim()}" foi adicionada.`,
      link: '/painel/contrapartidas',
    });
  }
  revalidatePath(`/painel/pipeline/${dealId}`);
  revalidatePath('/painel/contrapartidas');
  return { ok: true };
}

export async function updateDeliverableStatus(
  id: string,
  status: DeliverableStatus,
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();

  const patch: Record<string, unknown> = { status };
  if (status === 'completed') patch.done_date = new Date().toISOString().slice(0, 10);

  const { data: updated, error } = await supabase
    .from('deliverables')
    .update(patch)
    .eq('id', id)
    .select('deal_id, title, responsible_profile_id, deal:deals(company_profile_id, counterpart_profile_id, company:company_profiles(profile_id))')
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

  // Notifica a contraparte relevante.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deal: any = Array.isArray(updated?.deal) ? updated?.deal[0] : updated?.deal;
  const companyOwner = Array.isArray(deal?.company) ? deal?.company[0]?.profile_id : deal?.company?.profile_id;
  if (status === 'awaiting_approval' && companyOwner) {
    await notify(companyOwner, {
      type: 'status_changed',
      title: 'Contrapartida aguardando aprovação',
      body: `"${updated?.title}" está aguardando sua aprovação.`,
      link: '/painel/contrapartidas',
    });
  }
  if ((status === 'completed' || status === 'rejected') && updated?.responsible_profile_id) {
    await notify(updated.responsible_profile_id, {
      type: 'status_changed',
      title: status === 'completed' ? 'Contrapartida aprovada' : 'Contrapartida requer ajustes',
      body: `"${updated?.title}"`,
      link: '/painel/contrapartidas',
    });
  }

  revalidatePath('/painel/contrapartidas');
  if (updated?.deal_id) revalidatePath(`/painel/pipeline/${updated.deal_id}`);
  return { ok: true };
}

export async function addDeliverableEvidence(
  deliverableId: string,
  input: { url?: string; note?: string },
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  if (!input.url && !input.note) return { ok: false, error: 'Informe um link ou observação.' };
  const supabase = createClient();
  const { error } = await supabase.from('deliverable_evidence').insert({
    deliverable_id: deliverableId,
    url: nn(input.url),
    note: nn(input.note),
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/contrapartidas');
  return { ok: true };
}

export async function deleteDeliverable(id: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase.from('deliverables').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/contrapartidas');
  return { ok: true };
}
