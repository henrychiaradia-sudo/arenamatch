'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { slugify } from '@/lib/utils';
import { projectSchema, type ProjectInput } from '@/schemas/project';
import type { ProjectStatus } from '@/types/enums';

type Result = { ok: true; id?: string; slug?: string } | { ok: false; error: string };

const nn = (v: string | undefined | null) => (v == null || v === '' ? null : v);

function makeSlug(title: string) {
  return `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
}

async function resolveSportId(supabase: ReturnType<typeof createClient>, slug?: string) {
  if (!slug) return null;
  const { data } = await supabase.from('sports').select('id').eq('slug', slug).maybeSingle();
  return data?.id ?? null;
}

export async function createProject(input: ProjectInput): Promise<Result> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session || session.profile.role !== 'manager') {
    return { ok: false, error: 'Apenas gestores podem criar projetos.' };
  }
  const supabase = createClient();
  const { data: manager } = await supabase
    .from('manager_profiles')
    .select('id')
    .eq('profile_id', session.userId)
    .maybeSingle();
  if (!manager) return { ok: false, error: 'Perfil de gestor não encontrado.' };

  const d = parsed.data;
  const sportId = await resolveSportId(supabase, d.sportSlug || undefined);
  const slug = makeSlug(d.title);

  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug,
      title: d.title,
      description: nn(d.description),
      manager_profile_id: manager.id,
      sport_id: sportId,
      category: nn(d.category),
      state: nn(d.state),
      city: nn(d.city),
      scope: nn(d.scope),
      beneficiaries: nn(d.beneficiaries),
      objectives: nn(d.objectives),
      timeline: nn(d.timeline),
      total_cents: d.totalReais == null ? 0 : Math.round(d.totalReais * 100),
      funding_model: d.fundingModel,
      process_number: nn(d.processNumber),
      deadline: nn(d.deadline),
      has_social_impact: d.hasSocialImpact,
      status: 'draft',
    })
    .select('id, slug')
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/projetos');
  return { ok: true, id: data.id, slug: data.slug };
}

export async function updateProject(id: string, input: ProjectInput): Promise<Result> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const d = parsed.data;
  const sportId = await resolveSportId(supabase, d.sportSlug || undefined);

  const { error } = await supabase
    .from('projects')
    .update({
      title: d.title,
      description: nn(d.description),
      sport_id: sportId,
      category: nn(d.category),
      state: nn(d.state),
      city: nn(d.city),
      scope: nn(d.scope),
      beneficiaries: nn(d.beneficiaries),
      objectives: nn(d.objectives),
      timeline: nn(d.timeline),
      total_cents: d.totalReais == null ? 0 : Math.round(d.totalReais * 100),
      funding_model: d.fundingModel,
      process_number: nn(d.processNumber),
      deadline: nn(d.deadline),
      has_social_impact: d.hasSocialImpact,
    })
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/projetos');
  revalidatePath(`/painel/projetos/${id}`);
  return { ok: true, id };
}

export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase.from('projects').update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/projetos');
  return { ok: true, id };
}

export async function deleteProject(id: string): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };
  const supabase = createClient();
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/projetos');
  return { ok: true };
}
