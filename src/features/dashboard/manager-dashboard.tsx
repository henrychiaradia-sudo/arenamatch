import Link from 'next/link';
import { FolderKanban, Building2, Star, FileCheck2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import type { SessionContext } from '@/types/app';

export async function ManagerDashboard({ session }: { session: SessionContext }) {
  const supabase = createClient();
  const uid = session.userId;

  const { data: manager } = await supabase
    .from('manager_profiles')
    .select('id')
    .eq('profile_id', uid)
    .maybeSingle();
  const managerId = manager?.id ?? '00000000-0000-0000-0000-000000000000';

  const [projects, favs] = await Promise.all([
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('manager_profile_id', managerId),
    supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('profile_id', uid),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${session.profile.fullName.split(' ')[0]} 👋`}
        description="Cadastre projetos, vincule atletas e conecte-se a empresas patrocinadoras."
        actions={
          <Button asChild>
            <Link href="/painel/projetos">
              <FolderKanban className="h-4 w-4" /> Meus projetos
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projetos" value={formatNumber(projects.count ?? 0)} icon={FolderKanban} />
        <StatCard label="Favoritos" value={formatNumber(favs.count ?? 0)} icon={Star} />
        <StatCard label="Empresas interessadas" value="0" icon={Building2} />
        <StatCard label="Documentos pendentes" value="0" icon={FileCheck2} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos passos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/painel/perfil">Completar seu perfil</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/painel/projetos">Cadastrar um projeto</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/explorar/empresas">Buscar empresas</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
