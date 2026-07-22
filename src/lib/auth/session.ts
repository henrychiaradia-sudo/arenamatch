import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile, SessionContext } from '@/types/app';
import type { UserRole } from '@/types/enums';

/**
 * Camada de sessão no servidor. `cache()` evita múltiplas chamadas ao Supabase
 * dentro do mesmo render (dedupe por request).
 */

interface DbProfileRow {
  id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  account_status: Profile['accountStatus'];
  verification_status: Profile['verificationStatus'];
  plan_tier: Profile['planTier'];
  onboarding_completed: boolean;
  created_at: string;
}

function mapProfile(row: DbProfileRow): Profile {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name ?? 'Usuário',
    avatarUrl: row.avatar_url,
    accountStatus: row.account_status,
    verificationStatus: row.verification_status,
    planTier: row.plan_tier,
    onboardingCompleted: row.onboarding_completed,
    createdAt: row.created_at,
  };
}

/** Retorna o contexto de sessão (usuário + perfil) ou null se não autenticado. */
export const getSession = cache(async (): Promise<SessionContext | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, role, full_name, avatar_url, account_status, verification_status, plan_tier, onboarding_completed, created_at',
    )
    .eq('id', user.id)
    .single<DbProfileRow>();

  if (!profile) return null;

  return {
    userId: user.id,
    email: user.email ?? '',
    profile: mapProfile(profile),
  };
});

/** Exige sessão válida; redireciona para /entrar se ausente. */
export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) redirect('/entrar');
  return session;
}

/** Exige um papel específico; redireciona para o painel se não corresponder. */
export async function requireRole(...roles: UserRole[]): Promise<SessionContext> {
  const session = await requireSession();
  if (!roles.includes(session.profile.role)) redirect('/painel');
  return session;
}

/** Atalho: exige que o usuário seja administrador. */
export async function requireAdmin(): Promise<SessionContext> {
  return requireRole('admin');
}
