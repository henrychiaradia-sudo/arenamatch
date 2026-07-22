import { requireSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, email, userId } = await requireSession();
  const supabase = createClient();
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .is('read_at', null);

  return (
    <AppShell
      role={profile.role}
      fullName={profile.fullName}
      email={email}
      avatarUrl={profile.avatarUrl}
      unreadNotifications={count ?? 0}
    >
      {children}
    </AppShell>
  );
}
