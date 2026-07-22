'use client';

import * as React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateApplicationStatus } from '@/features/opportunities/actions';
import { APPLICATION_STATUSES, applicationStatusLabels, type ApplicationStatus } from '@/types/enums';
import { getInitials } from '@/lib/utils';

export interface Applicant {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  athleteSlug: string | null;
}

export function ApplicantsList({ items }: { items: Applicant[] }) {
  const [statuses, setStatuses] = React.useState<Record<string, ApplicationStatus>>(
    Object.fromEntries(items.map((i) => [i.id, i.status])),
  );

  async function onStatus(id: string, value: string) {
    const res = await updateApplicationStatus(id, value as ApplicationStatus);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    setStatuses((prev) => ({ ...prev, [id]: value as ApplicationStatus }));
    toast.success('Candidatura atualizada');
  }

  if (items.length === 0) {
    return <EmptyState icon={Users} title="Sem candidaturas" description="Ninguém se candidatou ainda." />;
  }

  return (
    <div className="space-y-2">
      {items.map((a) => (
        <Card key={a.id}>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {a.avatarUrl ? <AvatarImage src={a.avatarUrl} alt="" /> : null}
                <AvatarFallback>{getInitials(a.fullName)}</AvatarFallback>
              </Avatar>
              <div>
                {a.athleteSlug ? (
                  <Link href={`/atletas/${a.athleteSlug}`} className="font-medium hover:underline">
                    {a.fullName ?? 'Candidato'}
                  </Link>
                ) : (
                  <p className="font-medium">{a.fullName ?? 'Candidato'}</p>
                )}
                {a.message ? <p className="text-sm text-muted-foreground">{a.message}</p> : null}
              </div>
            </div>
            <Select value={statuses[a.id]} onValueChange={(v) => onStatus(a.id, v)}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {applicationStatusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
