'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setAccountStatus, setVerificationStatus, setUserPlan } from '@/features/admin/actions';
import {
  ACCOUNT_STATUSES,
  accountStatusLabels,
  VERIFICATION_STATUSES,
  verificationStatusLabels,
  PLAN_TIERS,
  planTierLabels,
  type AccountStatus,
  type VerificationStatus,
  type PlanTier,
} from '@/types/enums';

export function UserRowActions({
  profileId,
  accountStatus,
  verificationStatus,
  planTier,
}: {
  profileId: string;
  accountStatus: AccountStatus;
  verificationStatus: VerificationStatus;
  planTier: PlanTier;
}) {
  const router = useRouter();

  async function onAccount(v: string) {
    const res = await setAccountStatus(profileId, v as AccountStatus);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Conta atualizada');
    router.refresh();
  }
  async function onVerification(v: string) {
    const res = await setVerificationStatus(profileId, v as VerificationStatus);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Verificação atualizada');
    router.refresh();
  }
  async function onPlan(v: string) {
    const res = await setUserPlan(profileId, v as PlanTier);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Plano atualizado');
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={accountStatus} onValueChange={onAccount}>
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ACCOUNT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {accountStatusLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={verificationStatus} onValueChange={onVerification}>
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VERIFICATION_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {verificationStatusLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={planTier} onValueChange={onPlan}>
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PLAN_TIERS.map((s) => (
            <SelectItem key={s} value={s}>
              {planTierLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
