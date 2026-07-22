import { Users, Building2, FolderKanban, Megaphone, ShieldCheck, Flag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

export async function AdminDashboard() {
  const supabase = createClient();

  const [users, companies, projects, opps, pendingVerif, openReports] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('company_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('opportunities').select('id', { count: 'exact', head: true }),
    supabase
      .from('verification_requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['documents_pending', 'under_review']),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel administrativo"
        description="Visão geral da plataforma, moderação e verificações."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Usuários" value={formatNumber(users.count ?? 0)} icon={Users} />
        <StatCard label="Empresas" value={formatNumber(companies.count ?? 0)} icon={Building2} />
        <StatCard label="Projetos" value={formatNumber(projects.count ?? 0)} icon={FolderKanban} />
        <StatCard label="Oportunidades" value={formatNumber(opps.count ?? 0)} icon={Megaphone} />
        <StatCard
          label="Verificações pendentes"
          value={formatNumber(pendingVerif.count ?? 0)}
          icon={ShieldCheck}
        />
        <StatCard label="Denúncias abertas" value={formatNumber(openReports.count ?? 0)} icon={Flag} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Moderação</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          As telas de gestão de usuários, verificações, denúncias e configurações fazem parte das
          próximas fases. A estrutura de dados, permissões e trilha de auditoria já está pronta.
        </CardContent>
      </Card>
    </div>
  );
}
