import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRelativeTime } from '@/lib/format';

export default async function AdminContatoPage() {
  await requireAdmin();
  const supabase = createClient();

  const [{ data: messages }, { data: subscribers }] = await Promise.all([
    supabase
      .from('contact_messages')
      .select('id, name, email, subject, message, created_at, handled')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('newsletter_subscribers')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  const msgs = messages ?? [];
  const subs = subscribers ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contato & Newsletter"
        description="Mensagens recebidas pelo formulário de contato e inscritos na newsletter."
      />

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Mensagens de contato</h2>
          <Badge variant="secondary">{msgs.length}</Badge>
        </div>
        {msgs.length === 0 ? (
          <EmptyState title="Nenhuma mensagem" description="Ainda não há mensagens de contato." />
        ) : (
          <div className="space-y-2">
            {msgs.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{m.name}</p>
                      <a href={`mailto:${m.email}`} className="text-sm text-primary hover:underline">
                        {m.email}
                      </a>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(m.created_at)}
                    </span>
                  </div>
                  {m.subject ? <p className="mt-1 text-sm font-medium">{m.subject}</p> : null}
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{m.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Inscritos na newsletter</h2>
          <Badge variant="secondary">{subs.length}</Badge>
        </div>
        {subs.length === 0 ? (
          <EmptyState title="Nenhum inscrito" description="Ainda não há inscritos na newsletter." />
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {subs.map((s) => (
                  <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <a href={`mailto:${s.email}`} className="text-primary hover:underline">
                      {s.email}
                    </a>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(s.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
