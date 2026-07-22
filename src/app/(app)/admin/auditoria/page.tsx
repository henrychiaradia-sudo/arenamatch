import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTime } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function AdminAuditoriaPage() {
  await requireAdmin();
  const supabase = createClient();
  const { data } = await supabase
    .from('audit_logs')
    .select('id, action, entity_type, entity_id, created_at, actor:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(100);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader title="Auditoria" description="Registro de ações administrativas." />
      {rows.length === 0 ? (
        <EmptyState title="Sem registros" description="As ações administrativas aparecerão aqui." />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const actor = pickOne<{ full_name: string | null }>(r.actor);
            return (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.action}</Badge>
                    <span className="text-muted-foreground">
                      {r.entity_type} · {actor?.full_name ?? 'Sistema'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(r.created_at)}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
