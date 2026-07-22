import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ReportActions } from '@/features/admin/report-actions';
import { formatRelativeTime } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function AdminDenunciasPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data } = await supabase
    .from('reports')
    .select('id, target_type, reason, description, created_at, reporter:profiles(full_name)')
    .in('status', ['open', 'under_review'])
    .order('created_at', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader title="Denúncias" description="Denúncias abertas para moderação." />
      {rows.length === 0 ? (
        <EmptyState title="Nada pendente" description="Nenhuma denúncia aberta." />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const reporter = pickOne<{ full_name: string | null }>(r.reporter);
            return (
              <Card key={r.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{r.target_type}</Badge>
                      <p className="font-medium">{r.reason}</p>
                    </div>
                    {r.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      por {reporter?.full_name ?? 'Usuário'} · {formatRelativeTime(r.created_at)}
                    </p>
                  </div>
                  <ReportActions reportId={r.id} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
