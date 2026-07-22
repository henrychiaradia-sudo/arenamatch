'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Flag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { reportContent } from '@/features/moderation/actions';

export function ReportButton({
  targetType,
  targetId,
  isLoggedIn,
}: {
  targetType: string;
  targetId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (!isLoggedIn) return null;

  async function submit() {
    if (!reason.trim()) return;
    setLoading(true);
    const res = await reportContent(targetType, targetId, reason, description);
    setLoading(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Denúncia enviada', { description: 'Obrigado. Nossa equipe irá avaliar.' });
    setOpen(false);
    setReason('');
    setDescription('');
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="h-4 w-4" /> Denunciar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denunciar</DialogTitle>
          <DialogDescription>Ajude a manter a plataforma segura.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Motivo</Label>
            <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: informação falsa" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Detalhes (opcional)</Label>
            <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={loading || !reason.trim()} variant="destructive">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar denúncia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
