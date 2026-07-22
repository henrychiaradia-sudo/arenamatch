import { Search } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { UserRowActions } from '@/features/admin/user-row-actions';
import { getInitials, cn } from '@/lib/utils';
import { USER_ROLES, userRoleLabels, type UserRole } from '@/types/enums';

const selectClass =
  'h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string };
}) {
  await requireAdmin();
  const supabase = createClient();

  let query = supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role, account_status, verification_status, plan_tier, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (searchParams.role) query = query.eq('role', searchParams.role);
  if (searchParams.q) query = query.ilike('full_name', `%${searchParams.q}%`);

  const { data } = await query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader title="Usuários" description="Modere contas, verificações e planos." />

      <form method="get" action="/admin/usuarios" className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="text-xs font-medium text-muted-foreground">Buscar por nome</label>
          <Input id="q" name="q" defaultValue={searchParams.q ?? ''} placeholder="Nome..." className="mt-1" />
        </div>
        <div>
          <label htmlFor="role" className="mb-1 block text-xs font-medium text-muted-foreground">Papel</label>
          <select id="role" name="role" defaultValue={searchParams.role ?? ''} className={cn(selectClass, 'w-full sm:w-44')}>
            <option value="">Todos</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {userRoleLabels[r]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">
          <Search className="h-4 w-4" /> Filtrar
        </Button>
      </form>

      {users.length === 0 ? (
        <EmptyState title="Nenhum usuário" description="Ajuste os filtros." />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {u.avatar_url ? <AvatarImage src={u.avatar_url} alt="" /> : null}
                    <AvatarFallback>{getInitials(u.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{u.full_name ?? 'Usuário'}</p>
                    <Badge variant="secondary" className="mt-0.5">
                      {userRoleLabels[u.role as UserRole]}
                    </Badge>
                  </div>
                </div>
                <UserRowActions
                  profileId={u.id}
                  accountStatus={u.account_status}
                  verificationStatus={u.verification_status}
                  planTier={u.plan_tier}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
