'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Paperclip, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  updateDeliverableStatus,
  addDeliverableEvidence,
  deleteDeliverable,
} from '@/features/deliverables/actions';
import { DELIVERABLE_STATUSES, deliverableStatusLabels, type DeliverableStatus } from '@/types/enums';
import { formatDate } from '@/lib/format';

export interface DeliverableEvidence {
  id: string;
  url: string | null;
  note: string | null;
}

export interface DeliverableData {
  id: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  due_date: string | null;
  done_date: string | null;
  evidence: DeliverableEvidence[];
}

export function DeliverableRow({ item, canDelete }: { item: DeliverableData; canDelete?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = React.useState('');
  const [note, setNote] = React.useState('');
  const [adding, setAdding] = React.useState(false);

  async function onStatus(value: string) {
    const res = await updateDeliverableStatus(item.id, value as DeliverableStatus);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Status atualizado');
    router.refresh();
  }

  async function onAddEvidence() {
    if (!url && !note) return;
    setAdding(true);
    const res = await addDeliverableEvidence(item.id, { url, note });
    setAdding(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    setUrl('');
    setNote('');
    toast.success('Evidência adicionada');
    router.refresh();
  }

  async function onDelete() {
    const res = await deleteDeliverable(item.id);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Contrapartida removida');
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">{item.title}</p>
            {item.description ? (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {item.due_date ? `Prazo: ${formatDate(item.due_date)}` : 'Sem prazo'}
              {item.done_date ? ` · Concluída: ${formatDate(item.done_date)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={item.status} onValueChange={onStatus}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELIVERABLE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {deliverableStatusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canDelete ? (
              <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Remover">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            ) : null}
          </div>
        </div>

        {item.evidence.length > 0 ? (
          <div className="space-y-1 border-t pt-2 text-sm">
            {item.evidence.map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                {e.url ? (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {e.url}
                  </a>
                ) : (
                  <span>{e.note}</span>
                )}
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 border-t pt-2 sm:flex-row">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link da evidência (opcional)" className="h-9" />
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Observação" className="h-9" />
          <Button size="sm" variant="outline" onClick={onAddEvidence} disabled={adding || (!url && !note)}>
            <Plus className="h-4 w-4" /> Evidência
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
