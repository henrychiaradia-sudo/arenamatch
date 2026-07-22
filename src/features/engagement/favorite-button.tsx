'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleFavorite } from '@/features/engagement/actions';
import type { FavoritableType } from '@/types/enums';
import { cn } from '@/lib/utils';

interface Props {
  targetType: FavoritableType;
  targetId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
}

export function FavoriteButton({ targetType, targetId, initialFavorited, isLoggedIn }: Props) {
  const [favorited, setFavorited] = React.useState(initialFavorited);
  const [pending, setPending] = React.useState(false);

  if (!isLoggedIn) {
    return (
      <Button asChild variant="outline">
        <Link href="/entrar">
          <Heart className="h-4 w-4" /> Favoritar
        </Link>
      </Button>
    );
  }

  async function onClick() {
    setPending(true);
    const res = await toggleFavorite(targetType, targetId);
    setPending(false);
    if (!res.ok) return toast.error(res.error);
    setFavorited(res.favorited);
    toast.success(res.favorited ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  }

  return (
    <Button onClick={onClick} variant={favorited ? 'secondary' : 'outline'} disabled={pending}>
      <Heart className={cn('h-4 w-4', favorited && 'fill-current text-destructive')} />
      {favorited ? 'Favoritado' : 'Favoritar'}
    </Button>
  );
}
