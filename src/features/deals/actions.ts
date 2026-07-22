'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { notify } from '@/lib/notify';
import type { DealStatus } from '@/types/enums';

type Result = { ok: true; id?: string } | { ok: false; error: string };

const toCents = (v: number | undefined) => (v == null ? null : Math.round(v * 100));

async function getCompanyId(uid: string): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.from('company_profiles').select('id').eq('profile_id', uid).maybeSingle();
  return data?.id ?? null;
}

export async function createDeal(input: {
  title: string;
  athleteProfileId?: string;
  projectId?: string;
  opportunityId?: string;
  counterpartProfileId?: string;
  estimatedValueReais?: number;
}): Promise<Result> {
  const session = await getSession();
  if (!session || session.profile.role !== 'company') {
    return { ok: false, error: 'Apenas empresas podem iniciar negociações.' };
  }
  const companyId = await getCompanyId(session.userId);
  if (!companyId) return { ok: false, error: 'Perfil de empresa não encontrado.' };

  const supabase = createClient();
  const { data, error } = await supabase
    .from('deals')
    .insert({
      company_profile_id: companyId,
      athlete_profile_id: input.athleteProfileId ?? null,
      project_id: input.projectId ?? null,
      opportunity_id: input.opportunityId ?? null,
      counterpart_profile_id: input.counterpartProfileId ?? null,
      title: input.title,
      estimated_value_cents: toCents(input.estimatedValueReais),
      status: 'new_contact',
      owner_profile_id: session.userId,
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };

  if (input.counterpartProfileId) {
    await notify(input.counterpartProfileId, {
      type: 'new_interest',
      title: 'Nova negociação',
      body: `${session.profile.fullName} iniciou uma negociação com você.`,
      link: '/painel/conexoes',
    });
  }
  revalidatePath('/painel/pipeline');
  return { ok: true, id: data.id };
}

export async function updateDealStatus(id: string, status: DealStatus): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase.from('deals').update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/pipeline');
  revalidatePath(`/painel/pipeline/${id}`);
  return { ok: true, id };
}

export async function updateDeal(
  id: string,
  input: { estimatedValueReais?: number; nextStep?: string; nextContactOn?: string },
): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('deals')
    .update({
      estimated_value_cents: toCents(input.estimatedValueReais),
      next_step: input.nextStep && input.nextStep !== '' ? input.nextStep : null,
      next_contact_on: input.nextContactOn && input.nextContactOn !== '' ? input.nextContactOn : null,
    })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/pipeline');
  revalidatePath(`/painel/pipeline/${id}`);
  return { ok: true, id };
}

export async function addDealNote(id: string, body: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const text = body.trim();
  if (!text) return { ok: false, error: 'Nota vazia.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('deal_notes')
    .insert({ deal_id: id, author_profile_id: session.userId, body: text });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/painel/pipeline/${id}`);
  return { ok: true, id };
}

export async function deleteDeal(id: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase.from('deals').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/pipeline');
  return { ok: true };
}
