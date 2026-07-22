'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markNotificationRead, markAllNotificationsRead } from '@/features/notifications/actions';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationsClient({ items }: { items: NotificationItem[] }) {
  const router = useRouter();

  async function onOpen(item: NotificationItem) {
    if (!item.read_at) await markNotificationRead(item.id);
    if (item.link) router.push(item.link);
    else router.refresh();
  }

  async function markAll() {
    const res = await markAllNotificationsRead();
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Tudo marcado como lido');
    router.refresh();
  }

  const hasUnread = items.some((i) => !i.read_at);

  return (
    <div className="space-y-3">
      {hasUnread ? (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={markAll}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Button>
        </div>
      ) : null}
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item)}
            className={cn(
              'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
              !item.read_at && 'border-primary/40 bg-primary/5',
            )}
          >
            <span
              className={cn(
                'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                item.read_at ? 'bg-transparent' : 'bg-primary',
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.title}</p>
              {item.body ? <p className="text-sm text-muted-foreground">{item.body}</p> : null}
              <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(item.created_at)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
