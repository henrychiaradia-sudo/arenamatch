'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import type { FavoritableType } from '@/types/enums';

type FavResult = { ok: true; favorited: boolean } | { ok: false; error: string };

/** Alterna um favorito do usuário logado (adiciona/remove). */
export async function toggleFavorite(
  targetType: FavoritableType,
  targetId: string,
): Promise<FavResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Faça login para favoritar.' };

  const supabase = createClient();
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('profile_id', session.userId)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('favorites').delete().eq('id', existing.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/painel/favoritos');
    return { ok: true, favorited: false };
  }

  const { error } = await supabase
    .from('favorites')
    .insert({ profile_id: session.userId, target_type: targetType, target_id: targetId });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/painel/favoritos');
  return { ok: true, favorited: true };
}
