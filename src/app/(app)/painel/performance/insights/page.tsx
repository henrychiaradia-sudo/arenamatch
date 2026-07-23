import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  TrendingUp,
  AlertTriangle,
  Megaphone,
  RefreshCw,
  Target,
  Lightbulb,
  Coins,
} from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { computePerformance } from '@/lib/performance/engine';
import {
  generateInsights,
  renewalProbability,
  type DealSummary,
  type ChannelTotals,
  type InsightIcon,
} from '@/lib/performance/insights';
import { formatCurrency } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

const ICONS: Record<InsightIcon, LucideIcon> = {
  trophy: Trophy,
  'trending-up': TrendingUp,
  alert: AlertTriangle,
  megaphone: Megaphone,
  refresh: RefreshCw,
  target: Target,
  lightbulb: Lightbulb,
  coins: Coins,
};

const TONES: Record<'good' | 'warn' | 'info', { badge: string; icon: string }> = {
  good: { badge: 'bg-success/10 text-success', icon: 'text-success' },
  warn: { badge: 'bg-warning/10 text-warning', icon: 'text-warning' },
  info: { badge: 'bg-primary/10 text-primary', icon: 'text-primary' },
};

export default async function InsightsPage() {
  await requireRole('company');
  const supabase = createClient();

  const { data: dealsData } = await supabase.from('deals').select(
    `id, title, estimated_value_cents,
     counterpart:profiles!counterpart_profile_id(full_name),
     athlete:athlete_profiles!athlete_profile_id(followers_total, engagement_rate, estimated_reach),
     performance:sponsorship_performance(cpm_cents, extra_cost_cents, other_value_cents, reach_override),
     deliverables(status)`,
  );

  const [{ data: allClips }, { data: allLeads }, { data: allSurveys }, { data: allTv }, { data: allLic }] =
    await Promise.all([
      supabase.from('media_clippings').select('deal_id, ave_cents'),
      supabase.from('sponsorship_leads').select('deal_id, captured'),
      supabase.from('brand_surveys').select('deal_id, before_value, after_value'),
      supabase.from('tv_exposures').select('ave_cents'),
      supabase.from('licensing_records').select('revenue_cents'),
    ]);

  // Agregados por patrocínio
  const aveByDeal: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((allClips ?? []) as any[]).forEach((c) => {
    aveByDeal[c.deal_id] = (aveByDeal[c.deal_id] ?? 0) + Number(c.ave_cents || 0);
  });
  const leadsByDeal: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((allLeads ?? []) as any[]).forEach((l) => {
    leadsByDeal[l.deal_id] = (leadsByDeal[l.deal_id] ?? 0) + Number(l.captured || 0);
  });
  const liftSumByDeal: Record<string, number> = {};
  const liftNByDeal: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((allSurveys ?? []) as any[]).forEach((s) => {
    const lift = Number(s.after_value || 0) - Number(s.before_value || 0);
    liftSumByDeal[s.deal_id] = (liftSumByDeal[s.deal_id] ?? 0) + lift;
    liftNByDeal[s.deal_id] = (liftNByDeal[s.deal_id] ?? 0) + 1;
  });

  // Totais por canal (portfólio inteiro)
  const ch: ChannelTotals = {
    socialEmvCents: 0,
    earnedAveCents: 0,
    tvAveCents: 0,
    licensingRevenueCents: 0,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((allClips ?? []) as any[]).forEach((c) => {
    ch.earnedAveCents += Number(c.ave_cents || 0);
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((allTv ?? []) as any[]).forEach((t) => {
    ch.tvAveCents += Number(t.ave_cents || 0);
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((allLic ?? []) as any[]).forEach((l) => {
    ch.licensingRevenueCents += Number(l.revenue_cents || 0);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deals: DealSummary[] = ((dealsData ?? []) as any[]).map((d) => {
    const athlete = pickOne<{ followers_total: number | null; engagement_rate: number | null; estimated_reach: number | null }>(d.athlete);
    const perf = pickOne<{ cpm_cents: number; extra_cost_cents: number; other_value_cents: number; reach_override: number | null }>(d.performance);
    const cp = pickOne<{ full_name: string | null }>(d.counterpart);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delivs = (d.deliverables ?? []) as any[];
    const delivered = delivs.filter((x) => x.status === 'completed').length;
    const total = delivs.filter((x) => x.status !== 'cancelled').length;
    const reachPer = Number(athlete?.estimated_reach ?? 0) || Number(athlete?.followers_total ?? 0) * 3;
    const r = computePerformance({
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
    ch.socialEmvCents += r.emvCents;
    const liftN = liftNByDeal[d.id] ?? 0;
    const brandLift = liftN > 0 ? (liftSumByDeal[d.id] ?? 0) / liftN : 0;
    return {
      id: d.id,
      name: cp?.full_name ?? d.title,
      score: r.score,
      roas: r.roas,
      roiPct: r.roiPct,
      investmentCents: r.investmentCents,
      generatedValueCents: r.generatedValueCents,
      impressions: r.impressions,
      aveCents: aveByDeal[d.id] ?? 0,
      leads: leadsByDeal[d.id] ?? 0,
      brandLift,
    };
  });

  const insights = generateInsights(deals, ch);
  const byRenewal = [...deals].sort((a, b) => renewalProbability(b.score) - renewalProbability(a.score));

  return (
    <div className="space-y-6">
      <Link href="/painel/performance" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar à visão geral
      </Link>

      <PageHeader
        title="Insights & Recomendações"
        description="Análise automática do seu portfólio: o que está funcionando, onde há desperdício e o que fazer no próximo contrato."
      />

      {deals.length === 0 ? (
        <EmptyState
          title="Sem dados para analisar"
          description="Quando você tiver patrocínios com contrapartidas e métricas, os insights aparecem aqui."
        />
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{insights.length} insights</span> gerados a partir de{' '}
              {deals.length} {deals.length === 1 ? 'patrocínio' : 'patrocínios'}, cruzando retorno, alcance, mídia
              espontânea, TV, pesquisa de marca e leads.
            </p>
          </div>

          {/* Cartões de insight */}
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((ins, i) => {
              const Icon = ICONS[ins.icon];
              const tone = TONES[ins.tone];
              return (
                <Card key={i}>
                  <CardContent className="flex gap-4 p-5">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tone.badge}`}>
                      <Icon className={`h-5 w-5 ${tone.icon}`} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">{ins.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{ins.text}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Probabilidade de renovação por patrocínio */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <RefreshCw className="h-4 w-4 text-primary" /> Probabilidade de renovação
            </h2>
            <Card>
              <CardContent className="space-y-3 p-5">
                {byRenewal.map((d) => {
                  const p = renewalProbability(d.score);
                  const color = p >= 70 ? 'bg-success' : p >= 45 ? 'bg-primary' : 'bg-warning';
                  return (
                    <Link
                      key={d.id}
                      href={`/painel/performance/${d.id}`}
                      className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-md p-1 hover:bg-muted/40 sm:grid-cols-[180px_1fr_52px]"
                    >
                      <span className="truncate text-sm font-medium">{d.name}</span>
                      <div className="col-span-2 h-2 overflow-hidden rounded-full bg-muted sm:col-span-1">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${p}%` }} />
                      </div>
                      <span className="text-right text-sm font-bold tabular-nums">{p}%</span>
                    </Link>
                  );
                })}
                <p className="pt-1 text-xs text-muted-foreground">
                  Estimativa derivada do Sponsor Performance Score de cada patrocínio (retorno, entrega, alcance e
                  engajamento). Serve como priorização, não como garantia contratual.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Valor por canal */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Megaphone className="h-4 w-4 text-primary" /> De onde vem o valor
            </h2>
            {(() => {
              const channels = [
                { label: 'Redes sociais (EMV)', v: ch.socialEmvCents },
                { label: 'Mídia espontânea (AVE)', v: ch.earnedAveCents },
                { label: 'Televisão', v: ch.tvAveCents },
                { label: 'Licenciamento (receita)', v: ch.licensingRevenueCents },
              ].sort((a, b) => b.v - a.v);
              const max = Math.max(1, ...channels.map((c) => c.v));
              return (
                <Card>
                  <CardContent className="space-y-2.5 p-5">
                    {channels.map((c) => (
                      <div key={c.label} className="grid grid-cols-[150px_1fr_92px] items-center gap-3 text-sm">
                        <span className="truncate text-muted-foreground">{c.label}</span>
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(c.v / max) * 100}%` }} />
                        </div>
                        <span className="text-right text-xs font-medium tabular-nums">{formatCurrency(c.v)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          <p className="text-xs text-muted-foreground">
            Análise gerada automaticamente pela plataforma a partir dos dados registrados. Atualiza sozinha conforme
            você adiciona mídia, pesquisa e leads a cada patrocínio.
          </p>
        </>
      )}
    </div>
  );
}
