'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addDealNote } from '@/features/deals/actions';
import { formatRelativeTime } from '@/lib/format';

export interface DealNote {
  id: string;
  body: string;
  author: string | null;
  created_at: string;
}

export function DealNotes({ dealId, notes }: { dealId: string; notes: DealNote[] }) {
  const router = useRouter();
  const [body, setBody] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  async function add() {
    if (!body.trim()) return;
    setSaving(true);
    const res = await addDealNote(dealId, body);
    setSaving(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    setBody('');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Adicionar uma nota..."
        />
        <Button size="sm" onClick={add} disabled={saving || !body.trim()}>
          <Plus className="h-4 w-4" /> Adicionar nota
        </Button>
      </div>
      <div className="space-y-2">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma nota ainda.</p>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="rounded-lg border p-3 text-sm">
              <p className="whitespace-pre-wrap">{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {n.author ?? 'Usuário'} · {formatRelativeTime(n.created_at)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
