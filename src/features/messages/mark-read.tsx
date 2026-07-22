'use client';

import * as React from 'react';
import { markConversationRead } from '@/features/messages/actions';

/** Marca a conversa como lida ao abrir o thread (efeito colateral leve). */
export function MarkRead({ conversationId }: { conversationId: string }) {
  React.useEffect(() => {
    void markConversationRead(conversationId);
  }, [conversationId]);
  return null;
}
