import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/ui/page-header';
import { PlansGrid } from '@/features/billing/plans-grid';
import { ATHLETE_PLANS, COMPANY_PLANS } from '@/config/plans';

export default async function PainelPlanosPage() {
  const { profile } = await requireSession();
  const plans = profile.role === 'company' ? COMPANY_PLANS : ATHLETE_PLANS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planos"
        description="Escolha o plano ideal. Pagamentos são demonstrativos neste MVP."
      />
      {profile.role === 'manager' ? (
        <p className="text-sm text-muted-foreground">
          Gestores de projeto têm acesso gratuito às funcionalidades essenciais no MVP.
        </p>
      ) : (
        <PlansGrid plans={plans} currentTier={profile.planTier} columns={3} />
      )}
    </div>
  );
}
