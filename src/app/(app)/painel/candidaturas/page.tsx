import Link from 'next/link';
import { FileCheck2 } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { WithdrawButton } from '@/features/opportunities/withdraw-button';
import { applicationStatusLabels, type ApplicationStatus } from '@/types/enums';
import { formatRelativeTime } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function CandidaturasPage() {
  const session = await requireSession();
  const supabase = createClient();

  const { data } = await supabase
    .from('applications')
    .select('id, status, created_at, opportunity:opportunities(slug, title, company:company_profiles(public_name, legal_name))')
    .eq('applicant_profile_id', session.userId)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader title="Minhas candidaturas" description="Acompanhe o status das suas candidaturas." />

      {rows.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="Nenhuma candidatura"
          description="Explore oportunidades e candidate-se."
          action={
            <Button asChild>
              <Link href="/explorar/oportunidades">Ver oportunidades</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {rows.map((a) => {
            const opp = pickOne<{ slug: string | null; title: string; company: unknown }>(a.opportunity);
            const company = pickOne<{ public_name: string | null; legal_name: string | null }>(opp?.company);
            const status = a.status as ApplicationStatus;
            const canWithdraw = !['withdrawn', 'rejected', 'accepted'].includes(status);
            return (
              <Card key={a.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link
                      href={opp?.slug ? `/oportunidades/${opp.slug}` : '#'}
                      className="font-semibold hover:underline"
                    >
                      {opp?.title ?? 'Oportunidade'}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {company?.public_name ?? company?.legal_name ?? 'Empresa'} ·{' '}
                      {formatRelativeTime(a.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{applicationStatusLabels[status]}</Badge>
                    {canWithdraw ? <WithdrawButton id={a.id} /> : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
