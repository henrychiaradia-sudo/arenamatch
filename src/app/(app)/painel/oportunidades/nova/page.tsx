import { requireRole } from '@/lib/auth/session';
import { PageHeader } from '@/components/ui/page-header';
import { OpportunityForm } from '@/features/opportunities/opportunity-form';

export default async function NovaOportunidadePage() {
  await requireRole('company');
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova oportunidade"
        description="Descreva o que você busca e as contrapartidas desejadas."
      />
      <OpportunityForm mode="create" />
    </div>
  );
}
