import Link from 'next/link';
import { MessagesSquare } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { getInitials } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

type OtherProfile = { id: string; full_name: string | null; avatar_url: string | null };

export default async function MensagensPage() {
  const session = await requireSession();
  const me = session.userId;
  const supabase = createClient();

  const { data: memberships } = await supabase
    .from('conversation_members')
    .select('conversation_id, last_read_at')
    .eq('profile_id', me);

  const convIds = (memberships ?? []).map((m) => m.conversation_id);

  if (convIds.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Mensagens" description="Converse com suas conexões." />
        <EmptyState
          icon={MessagesSquare}
          title="Nenhuma conversa"
          description="Conecte-se com atletas ou empresas para iniciar uma conversa."
        />
      </div>
    );
  }

  const [{ data: others }, { data: msgs }] = await Promise.all([
    supabase
      .from('conversation_members')
      .select('conversation_id, profile:profiles(id, full_name, avatar_url)')
      .in('conversation_id', convIds)
      .neq('profile_id', me),
    supabase
      .from('messages')
      .select('conversation_id, body, created_at, sender_profile_id')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false }),
  ]);

  const lastRead: Record<string, string | null> = Object.fromEntries(
    (memberships ?? []).map((m) => [m.conversation_id, m.last_read_at]),
  );
  const otherMap: Record<string, OtherProfile | null> = {};
  for (const o of others ?? []) otherMap[o.conversation_id] = pickOne<OtherProfile>(o.profile);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastMsg: Record<string, any> = {};
  const unread: Record<string, number> = {};
  for (const m of msgs ?? []) {
    if (!lastMsg[m.conversation_id]) lastMsg[m.conversation_id] = m;
    const lr = lastRead[m.conversation_id];
    if (m.sender_profile_id !== me && (!lr || new Date(m.created_at) > new Date(lr))) {
      unread[m.conversation_id] = (unread[m.conversation_id] ?? 0) + 1;
    }
  }

  const items = convIds
    .map((id) => ({ id, other: otherMap[id], last: lastMsg[id], unread: unread[id] ?? 0 }))
    .sort((a, b) => (b.last?.created_at ?? '').localeCompare(a.last?.created_at ?? ''));

  return (
    <div className="space-y-6">
      <PageHeader title="Mensagens" description="Converse com suas conexões." />
      <div className="space-y-2">
        {items.map((it) => (
          <Link key={it.id} href={`/painel/mensagens/${it.id}`}>
            <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-accent">
              <Avatar>
                {it.other?.avatar_url ? <AvatarImage src={it.other.avatar_url} alt="" /> : null}
                <AvatarFallback>{getInitials(it.other?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{it.other?.full_name ?? 'Conversa'}</p>
                  {it.last ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(it.last.created_at)}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-muted-foreground">
                    {it.last?.body ?? 'Sem mensagens ainda'}
                  </p>
                  {it.unread > 0 ? <Badge className="shrink-0">{it.unread}</Badge> : null}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
