import type { Metadata } from 'next';
import { PageIntro } from '@/components/marketing/page-intro';
import { PlansGrid } from '@/features/billing/plans-grid';
import { ATHLETE_PLANS, COMPANY_PLANS } from '@/config/plans';

export const metadata: Metadata = { title: 'Planos' };

export default function PlanosPage() {
  return (
    <>
      <PageIntro
        eyebrow="Planos"
        title="Planos para atletas e empresas"
        description="Comece grátis e evolua conforme a sua necessidade. Pagamentos são demonstrativos neste MVP."
      />
      <section className="container space-y-16 py-16">
        <div>
          <h2 className="mb-6 font-display text-2xl font-bold">Para atletas</h2>
          <PlansGrid plans={ATHLETE_PLANS} columns={2} />
        </div>
        <div>
          <h2 className="mb-6 font-display text-2xl font-bold">Para empresas</h2>
          <PlansGrid plans={COMPANY_PLANS} columns={3} />
        </div>
      </section>
    </>
  );
}
