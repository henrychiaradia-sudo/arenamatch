import { Bell } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { NotificationsClient, type NotificationItem } from '@/features/notifications/notifications-client';

export default async function NotificacoesPage() {
  const session = await requireSession();
  const supabase = createClient();

  const { data } = await supabase
    .from('notifications')
    .select('id, title, body, link, read_at, created_at')
    .eq('profile_id', session.userId)
    .order('created_at', { ascending: false })
    .limit(100);

  const items = (data ?? []) as NotificationItem[];

  return (
    <div className="space-y-6">
      <PageHeader title="Notificações" description="Interesses, mensagens e atualizações." />
      {items.length === 0 ? (
        <EmptyState icon={Bell} title="Sem notificações" description="Tudo tranquilo por aqui." />
      ) : (
        <NotificationsClient items={items} />
      )}
    </div>
  );
}
