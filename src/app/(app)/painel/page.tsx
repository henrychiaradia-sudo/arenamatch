import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth/session';
import { OnboardingBanner } from '@/components/shared/onboarding-banner';
import { AthleteDashboard } from '@/features/dashboard/athlete-dashboard';
import { CompanyDashboard } from '@/features/dashboard/company-dashboard';
import { ManagerDashboard } from '@/features/dashboard/manager-dashboard';

export default async function PainelPage() {
  const session = await requireSession();
  const role = session.profile.role;

  if (role === 'admin') redirect('/admin');

  return (
    <div className="space-y-6">
      <OnboardingBanner completed={session.profile.onboardingCompleted} />
      {role === 'company' ? (
        <CompanyDashboard session={session} />
      ) : role === 'manager' ? (
        <ManagerDashboard session={session} />
      ) : (
        <AthleteDashboard session={session} />
      )}
    </div>
  );
}
