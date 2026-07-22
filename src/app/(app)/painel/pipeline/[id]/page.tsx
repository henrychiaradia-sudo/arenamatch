import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealStatusSelect } from '@/features/deals/deal-status-select';
import { DealDetailForm } from '@/features/deals/deal-detail-form';
import { DealNotes, type DealNote } from '@/features/deals/deal-notes';
import { DeliverablesManager } from '@/features/deliverables/deliverables-manager';
import type { DeliverableData } from '@/features/deliverables/deliverable-row';
import type { DealStatus } from '@/types/enums';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  await requireRole('company');
  const supabase = createClient();

  const { data: deal } = await supabase
    .from('deals')
    .select('id, title, status, estimated_value_cents, next_step, next_contact_on, counterpart:profiles!counterpart_profile_id(full_name)')
    .eq('id', params.id)
    .maybeSingle();

  if (!deal) notFound();

  const { data: noteRows } = await supabase
    .from('deal_notes')
    .select('id, body, created_at, author:profiles(full_name)')
    .eq('deal_id', params.id)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notes: DealNote[] = ((noteRows ?? []) as any[]).map((n) => ({
    id: n.id,
    body: n.body,
    author: pickOne<{ full_name: string | null }>(n.author)?.full_name ?? null,
    created_at: n.created_at,
  }));

  const counterpart = pickOne<{ full_name: string | null }>(deal.counterpart);

  const { data: delivRows } = await supabase
    .from('deliverables')
    .select('id, title, description, status, due_date, done_date, deliverable_evidence(id, url, note)')
    .eq('deal_id', params.id)
    .order('created_at', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deliverables: DeliverableData[] = ((delivRows ?? []) as any[]).map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    status: d.status,
    due_date: d.due_date,
    done_date: d.done_date,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evidence: (d.deliverable_evidence ?? []).map((e: any) => ({ id: e.id, url: e.url, note: e.note })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={deal.title}
        description={counterpart?.full_name ? `Com ${counterpart.full_name}` : undefined}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="max-w-xs">
          <DealStatusSelect id={deal.id} status={deal.status as DealStatus} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes</CardTitle>
        </CardHeader>
        <CardContent>
          <DealDetailForm
            id={deal.id}
            estimatedValueReais={deal.estimated_value_cents ? deal.estimated_value_cents / 100 : undefined}
            nextStep={deal.next_step ?? ''}
            nextContactOn={deal.next_contact_on ?? ''}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contrapartidas</CardTitle>
        </CardHeader>
        <CardContent>
          <DeliverablesManager dealId={deal.id} items={deliverables} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <DealNotes dealId={deal.id} notes={notes} />
        </CardContent>
      </Card>
    </div>
  );
}
