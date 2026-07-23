import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Eye,
  DollarSign,
  Users,
  ShoppingCart,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { computePerformance, renewalSignal, scoreLabel, formatCompact } from '@/lib/performance/engine';
import { formatCurrency } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function PerformanceOverviewPage() {
  await requireRole('company');
  const supabase = createClient();

  const [{ data }, { data: leadRows }] = await Promise.all([
    supabase
      .from('deals')
      .select(
        `id, title, estimated_value_cents,
         counterpart:profiles!counterpart_profile_id(full_name),
         athlete:athlete_profiles!athlete_profile_id(followers_total, engagement_rate, estimated_reach),
         performance:sponsorship_performance(cpm_cents, extra_cost_cents, other_value_cents, reach_override),
         deliverables(status)`,
      )
      .order('estimated_value_cents', { ascending: false }),
    supabase.from('sponsorship_leads').select('captured, converted'),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leads = (leadRows ?? []) as any[];
  const leadsCaptured = leads.reduce((s, l) => s + Number(l.captured || 0), 0);
  const leadsConverted = leads.reduce((s, l) => s + Number(l.converted || 0), 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = ((data ?? []) as any[]).map((d) => {
    const athlete = pickOne<{
      followers_total: number | null;
      engagement_rate: number | null;
      estimated_reach: number | null;
    }>(d.athlete);
    const perf = pickOne<{
      cpm_cents: number;
      extra_cost_cents: number;
      other_value_cents: number;
      reach_override: number | null;
    }>(d.performance);
    const counterpart = pickOne<{ full_name: string | null }>(d.counterpart);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delivs = (d.deliverables ?? []) as any[];
    const delivered = delivs.filter((x) => x.status === 'completed').length;
    const total = delivs.filter((x) => x.status !== 'cancelled').length;
    const reachPer = Number(athlete?.estimated_reach ?? 0) || Number(athlete?.followers_total ?? 0) * 3;

    const result = computePerformance({
      investmentCents: d.estimated_value_cents ?? 0,
      cpmCents: perf?.cpm_cents ?? 2200,
      extraCostCents: perf?.extra_cost_cents ?? 0,
      otherValueCents: perf?.other_value_cents ?? 0,
      reachOverride: perf?.reach_override ?? null,
      athleteReachPerDeliverable: reachPer,
      engagementRate: Number(athlete?.engagement_rate ?? 0),
      deliveredCount: delivered,
      totalDeliverables: total,
    });
    return { id: d.id, title: d.title, name: counterpart?.full_name ?? d.title, result };
  });

  rows.sort((a, b) => b.result.score - a.result.score);

  const agg = rows.reduce(
    (acc, r) => {
      acc.invest += r.result.investmentCents;
      acc.generated += r.result.generatedValueCents;
      acc.impressions += r.result.impressions;
      acc.engagement += r.result.engagementInteractions;
      acc.score += r.result.score;
      if (r.result.score >= 60) acc.renew += 1;
      return acc;
    },
    { invest: 0, generated: 0, impressions: 0, engagement: 0, score: 0, renew: 0 },
  );
  const avgScore = rows.length ? Math.round(agg.score / rows.length) : 0;
  const roiPct = agg.invest > 0 ? Math.round(((agg.generated - agg.invest) / agg.invest) * 100) : 0;

  const questions: { icon: LucideIcon; q: string; value: string; unit: string; muted?: boolean }[] = [
    {
      icon: Eye,
      q: 'Quanto de exposição eu tive?',
      value: `${formatCompact(agg.impressions)}`,
      unit: 'impressões estimadas',
    },
    {
      icon: DollarSign,
      q: 'Quanto isso valeu?',
      value: formatCurrency(agg.generated),
      unit: `valor gerado · ROI ${roiPct >= 0 ? '+' : ''}${roiPct}%`,
    },
    {
      icon: Users,
      q: 'Meu público foi impactado?',
      value: `${formatCompact(agg.engagement)}`,
      unit: 'interações estimadas',
    },
    {
      icon: ShoppingCart,
      q: 'Isso gerou negócio?',
      value: leadsCaptured > 0 ? formatCompact(leadsCaptured) : '—',
      unit: leadsCaptured > 0 ? `leads · ${formatCompact(leadsConverted)} convertidos` : 'sem leads registrados',
      muted: leadsCaptured === 0,
    },
    {
      icon: RefreshCw,
      q: 'Vale renovar?',
      value: `${agg.renew}/${rows.length}`,
      unit: 'patrocínios recomendados',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance do Patrocínio"
        description="O valor real gerado pelos seus patrocínios — da exposição à recomendação de renovação."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhum patrocínio ainda"
          description="Quando você tiver negociações com contrapartidas, a performance aparece aqui."
        />
      ) : (
        <>
          {/* As 5 perguntas do diretor de marketing */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {questions.map((q) => (
              <Card key={q.q} className={q.muted ? 'border-dashed' : undefined}>
                <CardContent className="p-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <q.icon className="h-3.5 w-3.5" /> {q.q}
                  </p>
                  <p className={`mt-2 text-2xl font-bold tracking-tight ${q.muted ? 'text-muted-foreground' : ''}`}>
                    {q.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{q.unit}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resumo do portfólio */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Investimento total</p>
                <p className="mt-1 font-display text-2xl font-bold">{formatCurrency(agg.invest)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Valor total gerado</p>
                <p className="mt-1 font-display text-2xl font-bold text-primary">{formatCurrency(agg.generated)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Score médio do portfólio</p>
                <p className="mt-1 font-display text-2xl font-bold">{avgScore}<span className="text-base text-muted-foreground">/100</span></p>
              </CardContent>
            </Card>
          </div>

          {/* Insights (IA) */}
          <Link href="/painel/performance/insights" className="block">
            <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Insights &amp; recomendações automáticas</p>
                  <p className="text-sm text-muted-foreground">
                    A plataforma analisa seu portfólio e diz o que renovar, onde há desperdício e onde está o maior valor.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
              </CardContent>
            </Card>
          </Link>

          {/* Ranking */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Seus patrocínios por performance</h2>
              <Link
                href="/painel/performance/benchmark"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Comparar (benchmark) <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {rows.map((row) => {
                const { tone } = scoreLabel(row.result.score);
                const renewal = renewalSignal(row.result.score);
                const color = tone === 'good' ? 'bg-success' : tone === 'ok' ? 'bg-primary' : 'bg-warning';
                return (
                  <Link key={row.id} href={`/painel/performance/${row.id}`} className="block">
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex flex-wrap items-center gap-4 p-4">
                        <div className="flex w-14 flex-col items-center">
                          <span className="font-display text-2xl font-bold leading-none">{row.result.score}</span>
                          <span className="text-[10px] text-muted-foreground">score</span>
                        </div>
                        <div className="min-w-[140px] flex-1">
                          <p className="font-medium">{row.name}</p>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${row.result.score}%` }} />
                          </div>
                        </div>
                        <div className="hidden text-right sm:block">
                          <p className="text-[11px] text-muted-foreground">Investido</p>
                          <p className="text-sm font-medium">{formatCurrency(row.result.investmentCents)}</p>
                        </div>
                        <div className="hidden text-right md:block">
                          <p className="text-[11px] text-muted-foreground">Alcance</p>
                          <p className="text-sm font-medium">{formatCompact(row.result.impressions)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-muted-foreground">ROAS</p>
                          <p className="text-sm font-bold text-primary">
                            {row.result.roas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x
                          </p>
                        </div>
                        <Badge variant={renewal.recommend ? 'default' : 'secondary'} className="hidden gap-1 lg:inline-flex">
                          {renewal.recommend ? <CheckCircle2 className="h-3 w-3" /> : null}
                          {renewal.recommend ? 'Renovar' : 'Reavaliar'}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
