'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { clippingSchema, surveySchema, leadSchema } from '@/schemas/media';

type Result = { ok: true } | { ok: false; error: string };

function revalidate(dealId: string) {
  revalidatePath(`/painel/performance/${dealId}/dados`);
  revalidatePath(`/painel/performance/${dealId}`);
}

export async function addClipping(dealId: string, input: unknown): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const parsed = clippingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const c = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('media_clippings').insert({
    deal_id: dealId,
    outlet_type: c.outletType,
    outlet_name: c.outletName.trim(),
    title: c.title && c.title.trim() !== '' ? c.title.trim() : null,
    reach: c.reach,
    ave_cents: Math.round(c.aveReais * 100),
    sentiment: c.sentiment,
  });
  if (error) return { ok: false, error: 'Não foi possível salvar. Verifique se o patrocínio é seu.' };
  revalidate(dealId);
  return { ok: true };
}

export async function addSurveyMetric(dealId: string, input: unknown): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const parsed = surveySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const s = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('brand_surveys').insert({
    deal_id: dealId,
    metric: s.metric,
    unit: s.unit || '%',
    before_value: s.beforeValue,
    after_value: s.afterValue,
  });
  if (error) return { ok: false, error: 'Não foi possível salvar.' };
  revalidate(dealId);
  return { ok: true };
}

export async function addLead(dealId: string, input: unknown): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const l = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('sponsorship_leads').insert({
    deal_id: dealId,
    source: l.source,
    captured: l.captured,
    converted: l.converted,
  });
  if (error) return { ok: false, error: 'Não foi possível salvar.' };
  revalidate(dealId);
  return { ok: true };
}
