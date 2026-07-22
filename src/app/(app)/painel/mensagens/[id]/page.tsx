import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCheck } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageComposer } from '@/features/messages/message-composer';
import { MarkRead } from '@/features/messages/mark-read';
import { getInitials, cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

type Member = { id: string; full_name: string | null; avatar_url: string | null };

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const me = session.userId;
  const supabase = createClient();

  const { data: members } = await supabase
    .from('conversation_members')
    .select('profile:profiles(id, full_name, avatar_url)')
    .eq('conversation_id', params.id);

  if (!members || members.length === 0) notFound();

  const memberProfiles = members.map((m) => pickOne<Member>(m.profile)).filter(Boolean) as Member[];
  const other = memberProfiles.find((m) => m.id !== me) ?? null;

  const { data: messages } = await supabase
    .from('messages')
    .select('id, body, created_at, sender_profile_id, read_at')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true });

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col overflow-hidden rounded-xl border bg-card">
      <MarkRead conversationId={params.id} />
      <div className="flex items-center gap-3 border-b p-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link href="/painel/mensagens">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Avatar className="h-9 w-9">
          {other?.avatar_url ? <AvatarImage src={other.avatar_url} alt="" /> : null}
          <AvatarFallback>{getInitials(other?.full_name)}</AvatarFallback>
        </Avatar>
        <p className="font-medium">{other?.full_name ?? 'Conversa'}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {(messages ?? []).length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Diga olá! 👋
          </p>
        ) : (
          (messages ?? []).map((m) => {
            const mine = m.sender_profile_id === me;
            return (
              <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                    mine ? 'bg-primary text-primary-foreground' : 'bg-muted',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <div
                    className={cn(
                      'mt-1 flex items-center gap-1 text-[10px]',
                      mine ? 'text-primary-foreground/70' : 'text-muted-foreground',
                    )}
                  >
                    {formatDateTime(m.created_at)}
                    {mine && m.read_at ? <CheckCheck className="h-3 w-3" /> : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageComposer conversationId={params.id} />
    </div>
  );
}
