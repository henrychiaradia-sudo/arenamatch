'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { sendMessage } from '@/features/messages/actions';

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState('');
  const [sending, setSending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    setSending(true);
    const res = await sendMessage(conversationId, text);
    setSending(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    setValue('');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 border-t bg-background p-3">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escreva uma mensagem..."
        maxLength={4000}
        autoComplete="off"
      />
      <Button type="submit" size="icon" disabled={sending || !value.trim()} aria-label="Enviar">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
}
