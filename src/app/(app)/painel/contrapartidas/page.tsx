import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { DeliverableRow, type DeliverableData } from '@/features/deliverables/deliverable-row';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function ContrapartidasPage() {
  const session = await requireSession();
  const supabase = createClient();
  const isCompany = session.profile.role === 'company';

  // RLS já limita os entregáveis aos que o usuário pode ver (suas negociações).
  const { data } = await supabase
    .from('deliverables')
    .select('id, title, description, status, due_date, done_date, deal:deals(id, title), deliverable_evidence(id, url, note)')
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = ((data ?? []) as any[]).map((d) => ({
    data: {
      id: d.id,
      title: d.title,
      description: d.description,
      status: d.status,
      due_date: d.due_date,
      done_date: d.done_date,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      evidence: (d.deliverable_evidence ?? []).map((e: any) => ({ id: e.id, url: e.url, note: e.note })),
    } as DeliverableData,
    deal: pickOne<{ id: string; title: string }>(d.deal),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contrapartidas"
        description={
          isCompany
            ? 'Acompanhe e aprove as contrapartidas das suas negociações.'
            : 'Acompanhe e envie evidências das suas contrapartidas.'
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Nenhuma contrapartida"
          description="As contrapartidas aparecem quando uma negociação avança. Crie-as no detalhe da negociação."
        />
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.data.id} className="space-y-1">
              {r.deal ? (
                <Link
                  href={`/painel/pipeline/${r.deal.id}`}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {r.deal.title}
                </Link>
              ) : null}
              <DeliverableRow item={r.data} canDelete={isCompany} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
