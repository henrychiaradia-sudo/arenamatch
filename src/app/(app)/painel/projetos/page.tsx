import Link from 'next/link';
import { FolderKanban, Plus } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { ProjectRowActions } from '@/features/projects/project-row-actions';
import { formatCurrency } from '@/lib/format';
import { projectStatusLabels, type ProjectStatus } from '@/types/enums';

export default async function ProjetosPage() {
  const session = await requireSession();
  const supabase = createClient();
  const isManager = session.profile.role === 'manager';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rows: any[] = [];

  if (isManager) {
    const { data: manager } = await supabase
      .from('manager_profiles')
      .select('id')
      .eq('profile_id', session.userId)
      .maybeSingle();
    if (manager) {
      const { data } = await supabase
        .from('projects')
        .select('id, slug, title, status, total_cents, raised_cents')
        .eq('manager_profile_id', manager.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      rows = data ?? [];
    }
  } else {
    // Atleta: projetos aos quais está vinculado (somente leitura)
    const { data: ath } = await supabase
      .from('athlete_profiles')
      .select('id')
      .eq('profile_id', session.userId)
      .maybeSingle();
    if (ath) {
      const { data } = await supabase
        .from('project_athletes')
        .select('project:projects(id, slug, title, status, total_cents, raised_cents)')
        .eq('athlete_profile_id', ath.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rows = (data ?? []).map((r: any) => r.project).filter(Boolean);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isManager ? 'Meus projetos' : 'Projetos'}
        description={
          isManager
            ? 'Cadastre e gerencie seus projetos esportivos.'
            : 'Projetos aos quais você está vinculado.'
        }
        actions={
          isManager ? (
            <Button asChild>
              <Link href="/painel/projetos/novo">
                <Plus className="h-4 w-4" /> Novo projeto
              </Link>
            </Button>
          ) : undefined
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Nenhum projeto"
          description={isManager ? 'Crie seu primeiro projeto esportivo.' : 'Você ainda não está vinculado a projetos.'}
          action={
            isManager ? (
              <Button asChild>
                <Link href="/painel/projetos/novo">Criar projeto</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((p) => {
            const pct = p.total_cents > 0 ? Math.round((p.raised_cents / p.total_cents) * 100) : 0;
            return (
              <Card key={p.id}>
                <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={p.slug ? `/projetos/${p.slug}` : '#'}
                        className="truncate font-semibold hover:underline"
                      >
                        {p.title}
                      </Link>
                      <Badge variant="outline">{projectStatusLabels[p.status as ProjectStatus]}</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={pct} className="max-w-xs" />
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(p.raised_cents)} / {formatCurrency(p.total_cents)}
                      </span>
                    </div>
                  </div>
                  {isManager ? (
                    <ProjectRowActions id={p.id} status={p.status as ProjectStatus} />
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
