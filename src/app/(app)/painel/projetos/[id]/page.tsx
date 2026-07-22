import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { ProjectForm } from '@/features/projects/project-form';
import type { ProjectInput } from '@/schemas/project';
import type { FundingModel } from '@/types/enums';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function EditarProjetoPage({ params }: { params: { id: string } }) {
  await requireRole('manager');
  const supabase = createClient();
  const { data: p } = await supabase
    .from('projects')
    .select('*, sport:sports(slug)')
    .eq('id', params.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!p) notFound();

  const sport = pickOne<{ slug: string }>(p.sport);
  const defaults: Partial<ProjectInput> = {
    title: p.title ?? '',
    description: p.description ?? '',
    sportSlug: sport?.slug ?? '',
    category: p.category ?? '',
    state: p.state ?? '',
    city: p.city ?? '',
    scope: p.scope ?? '',
    beneficiaries: p.beneficiaries ?? '',
    objectives: p.objectives ?? '',
    timeline: p.timeline ?? '',
    totalReais: p.total_cents ? p.total_cents / 100 : undefined,
    fundingModel: (p.funding_model as FundingModel) ?? 'incentive',
    processNumber: p.process_number ?? '',
    deadline: p.deadline ?? '',
    hasSocialImpact: p.has_social_impact ?? true,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Editar projeto" description={p.title ?? ''} />
      <ProjectForm mode="edit" projectId={params.id} defaults={defaults} />
    </div>
  );
}
