'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Heart, HeartHandshake, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleFavorite } from '@/features/engagement/actions';
import { sendConnectionRequest } from '@/features/connections/actions';
import type { FavoritableType } from '@/types/enums';
import { cn } from '@/lib/utils';

interface Props {
  targetType: FavoritableType;
  targetId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  /** profile_id do dono do perfil (para "demonstrar interesse" / conexão). */
  interestTargetProfileId?: string;
  /** true quando o próprio usuário está vendo seu perfil. */
  isSelf?: boolean;
}

export function ProfileActions({
  targetType,
  targetId,
  initialFavorited,
  isLoggedIn,
  interestTargetProfileId,
  isSelf,
}: Props) {
  const [favorited, setFavorited] = React.useState(initialFavorited);
  const [pending, setPending] = React.useState(false);
  const [interestSent, setInterestSent] = React.useState(false);

  async function onFavorite() {
    setPending(true);
    const res = await toggleFavorite(targetType, targetId);
    setPending(false);
    if (!res.ok) return toast.error(res.error);
    setFavorited(res.favorited);
    toast.success(res.favorited ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  }

  async function onInterest() {
    if (!interestTargetProfileId) return;
    setPending(true);
    const res = await sendConnectionRequest(interestTargetProfileId, {
      contextType: targetType,
      contextId: targetId,
    });
    setPending(false);
    if (!res.ok) return toast.error('Não foi possível', { description: res.error });
    setInterestSent(true);
    toast.success('Interesse enviado!', { description: 'A pessoa será notificada.' });
  }

  if (!isLoggedIn) {
    return (
      <Button asChild>
        <Link href="/entrar">Entrar para interagir</Link>
      </Button>
    );
  }

  if (isSelf) {
    return (
      <Button asChild variant="outline">
        <Link href="/painel/perfil">Editar meu perfil</Link>
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onFavorite} variant={favorited ? 'secondary' : 'outline'} disabled={pending}>
        <Heart className={cn('h-4 w-4', favorited && 'fill-current text-destructive')} />
        {favorited ? 'Favoritado' : 'Favoritar'}
      </Button>
      {interestTargetProfileId ? (
        <Button onClick={onInterest} disabled={pending || interestSent}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartHandshake className="h-4 w-4" />}
          {interestSent ? 'Interesse enviado' : 'Demonstrar interesse'}
        </Button>
      ) : null}
      <Button asChild variant="outline">
        <Link href="/painel/mensagens">
          <MessageSquare className="h-4 w-4" /> Mensagens
        </Link>
      </Button>
    </div>
  );
}
