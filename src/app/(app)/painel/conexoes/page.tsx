import Link from 'next/link';
import { Handshake, MessageSquare } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { RequestActions } from '@/features/connections/request-actions';
import { getInitials } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function ConexoesPage() {
  const session = await requireSession();
  const me = session.userId;
  const supabase = createClient();

  const [received, sent, connections] = await Promise.all([
    supabase
      .from('connection_requests')
      .select('id, message, created_at, requester:profiles!requester_profile_id(full_name, avatar_url)')
      .eq('target_profile_id', me)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('connection_requests')
      .select('id, created_at, target:profiles!target_profile_id(full_name, avatar_url)')
      .eq('requester_profile_id', me)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('connections')
      .select('id, profile_a, profile_b, created_at')
      .or(`profile_a.eq.${me},profile_b.eq.${me}`)
      .order('created_at', { ascending: false }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const receivedRows = (received.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sentRows = (sent.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connRows = (connections.data ?? []) as any[];

  const otherIds = connRows.map((c) => (c.profile_a === me ? c.profile_b : c.profile_a));
  const otherProfiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
  if (otherIds.length) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', otherIds);
    for (const p of profs ?? []) otherProfiles[p.id] = p;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Conexões" description="Solicitações e conexões ativas." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solicitações recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          {receivedRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>
          ) : (
            <div className="space-y-2">
              {receivedRows.map((r) => {
                const p = pickOne<{ full_name: string | null; avatar_url: string | null }>(r.requester);
                return (
                  <div key={r.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {p?.avatar_url ? <AvatarImage src={p.avatar_url} alt="" /> : null}
                        <AvatarFallback>{getInitials(p?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{p?.full_name ?? 'Usuário'}</p>
                        {r.message ? <p className="text-sm text-muted-foreground">{r.message}</p> : null}
                      </div>
                    </div>
                    <RequestActions requestId={r.id} mode="received" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solicitações enviadas</CardTitle>
        </CardHeader>
        <CardContent>
          {sentRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação enviada.</p>
          ) : (
            <div className="space-y-2">
              {sentRows.map((r) => {
                const p = pickOne<{ full_name: string | null; avatar_url: string | null }>(r.target);
                return (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {p?.avatar_url ? <AvatarImage src={p.avatar_url} alt="" /> : null}
                        <AvatarFallback>{getInitials(p?.full_name)}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{p?.full_name ?? 'Usuário'}</p>
                    </div>
                    <RequestActions requestId={r.id} mode="sent" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conexões ativas</CardTitle>
        </CardHeader>
        <CardContent>
          {connRows.length === 0 ? (
            <EmptyState icon={Handshake} title="Sem conexões" description="Aceite ou envie solicitações para conectar." />
          ) : (
            <div className="space-y-2">
              {connRows.map((c) => {
                const otherId = c.profile_a === me ? c.profile_b : c.profile_a;
                const p = otherProfiles[otherId];
                return (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {p?.avatar_url ? <AvatarImage src={p.avatar_url} alt="" /> : null}
                        <AvatarFallback>{getInitials(p?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{p?.full_name ?? 'Usuário'}</p>
                        <p className="text-xs text-muted-foreground">
                          Conectado {formatRelativeTime(c.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/painel/mensagens">
                        <MessageSquare className="h-4 w-4" /> Conversar
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
