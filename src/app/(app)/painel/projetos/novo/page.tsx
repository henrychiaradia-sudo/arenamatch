import { requireRole } from '@/lib/auth/session';
import { PageHeader } from '@/components/ui/page-header';
import { ProjectForm } from '@/features/projects/project-form';

export default async function NovoProjetoPage() {
  await requireRole('manager');
  return (
    <div className="space-y-6">
      <PageHeader title="Novo projeto" description="Cadastre um projeto esportivo." />
      <ProjectForm mode="create" />
    </div>
  );
}
