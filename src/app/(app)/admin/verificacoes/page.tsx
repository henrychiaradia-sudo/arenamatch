import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { VerificationActions } from '@/features/admin/verification-actions';
import { formatRelativeTime } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function AdminVerificacoesPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data } = await supabase
    .from('verification_requests')
    .select('id, subject_type, created_at, requester:profiles(full_name)')
    .in('status', ['documents_pending', 'under_review'])
    .order('created_at', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader title="Verificações" description="Solicitações pendentes de verificação." />
      {rows.length === 0 ? (
        <EmptyState title="Nada pendente" description="Nenhuma verificação aguardando análise." />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const requester = pickOne<{ full_name: string | null }>(r.requester);
            return (
              <Card key={r.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{requester?.full_name ?? 'Usuário'}</p>
                    <p className="text-sm text-muted-foreground">
                      <Badge variant="secondary" className="mr-2">
                        {r.subject_type}
                      </Badge>
                      Solicitado {formatRelativeTime(r.created_at)}
                    </p>
                  </div>
                  <VerificationActions requestId={r.id} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
