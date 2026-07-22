'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { applyToOpportunity } from '@/features/opportunities/actions';

interface Props {
  opportunityId: string;
  isLoggedIn: boolean;
  canApply: boolean;
  alreadyApplied: boolean;
  isOpen: boolean;
}

export function ApplyButton({ opportunityId, isLoggedIn, canApply, alreadyApplied, isOpen }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) {
    return (
      <Button disabled variant="outline">
        Inscrições encerradas
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button asChild>
        <Link href="/entrar">Entrar para se candidatar</Link>
      </Button>
    );
  }

  if (!canApply) return null;

  if (alreadyApplied) {
    return (
      <Button disabled variant="secondary">
        <Check className="h-4 w-4" /> Candidatura enviada
      </Button>
    );
  }

  async function submit() {
    setLoading(true);
    const res = await applyToOpportunity(opportunityId, message);
    setLoading(false);
    if (!res.ok) return toast.error('Não foi possível candidatar', { description: res.error });
    toast.success('Candidatura enviada!');
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="h-4 w-4" /> Candidatar-se
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Candidatar-se à oportunidade</DialogTitle>
          <DialogDescription>
            Conte por que você é um bom match. A empresa verá sua mensagem e seu perfil.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="msg">Mensagem (opcional)</Label>
          <Textarea
            id="msg"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Apresente-se brevemente..."
          />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar candidatura'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
