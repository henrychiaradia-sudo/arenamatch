'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import {
  tvSchema,
  audienceSchema,
  hospitalitySchema,
  licensingSchema,
  merchSchema,
} from '@/schemas/nivelb';

type Result = { ok: true } | { ok: false; error: string };
const fail: Result = { ok: false, error: 'Não foi possível salvar. Verifique se o patrocínio é seu.' };

function revalidate(dealId: string) {
  revalidatePath(`/painel/performance/${dealId}/dados`);
  revalidatePath(`/painel/performance/${dealId}`);
}

export async function addTvExposure(dealId: string, input: unknown): Promise<Result> {
  if (!(await getSession())) return { ok: false, error: 'Não autenticado.' };
  const p = tvSchema.safeParse(input);
  if (!p.success) return { ok: false, error: 'Dados inválidos.' };
  const { error } = await createClient().from('tv_exposures').insert({
    deal_id: dealId,
    program: p.data.program.trim(),
    exposure_type: p.data.exposureType,
    seconds: p.data.seconds,
    insertions: p.data.insertions,
    audience: p.data.audience,
    ave_cents: Math.round(p.data.aveReais * 100),
  });
  if (error) return fail;
  revalidate(dealId);
  return { ok: true };
}

export async function addAudienceSegment(dealId: string, input: unknown): Promise<Result> {
  if (!(await getSession())) return { ok: false, error: 'Não autenticado.' };
  const p = audienceSchema.safeParse(input);
  if (!p.success) return { ok: false, error: 'Dados inválidos.' };
  const { error } = await createClient().from('audience_segments').insert({
    deal_id: dealId,
    dimension: p.data.dimension,
    label: p.data.label.trim(),
    pct: p.data.pct,
  });
  if (error) return fail;
  revalidate(dealId);
  return { ok: true };
}

export async function addHospitality(dealId: string, input: unknown): Promise<Result> {
  if (!(await getSession())) return { ok: false, error: 'Não autenticado.' };
  const p = hospitalitySchema.safeParse(input);
  if (!p.success) return { ok: false, error: 'Dados inválidos.' };
  const { error } = await createClient().from('hospitality_events').insert({
    deal_id: dealId,
    event_name: p.data.eventName.trim(),
    guests: p.data.guests,
    clients: p.data.clients,
    executives: p.data.executives,
    deals_started: p.data.dealsStarted,
    deals_closed: p.data.dealsClosed,
    satisfaction: p.data.satisfaction,
  });
  if (error) return fail;
  revalidate(dealId);
  return { ok: true };
}

export async function addLicensing(dealId: string, input: unknown): Promise<Result> {
  if (!(await getSession())) return { ok: false, error: 'Não autenticado.' };
  const p = licensingSchema.safeParse(input);
  if (!p.success) return { ok: false, error: 'Dados inválidos.' };
  const { error } = await createClient().from('licensing_records').insert({
    deal_id: dealId,
    product: p.data.product.trim(),
    region: p.data.region && p.data.region.trim() !== '' ? p.data.region.trim() : null,
    units_sold: p.data.unitsSold,
    revenue_cents: Math.round(p.data.revenueReais * 100),
    royalties_cents: Math.round(p.data.royaltiesReais * 100),
  });
  if (error) return fail;
  revalidate(dealId);
  return { ok: true };
}

export async function addMerchandising(dealId: string, input: unknown): Promise<Result> {
  if (!(await getSession())) return { ok: false, error: 'Não autenticado.' };
  const p = merchSchema.safeParse(input);
  if (!p.success) return { ok: false, error: 'Dados inválidos.' };
  const { error } = await createClient().from('merchandising_points').insert({
    deal_id: dealId,
    pdv_name: p.data.pdvName.trim(),
    region: p.data.region && p.data.region.trim() !== '' ? p.data.region.trim() : null,
    material_type: p.data.materialType,
    points: p.data.points,
  });
  if (error) return fail;
  revalidate(dealId);
  return { ok: true };
}
