import Link from 'next/link';
import { ArrowLeft, Trophy, TrendingUp, Megaphone, Star } from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { computePerformance, formatCompact } from '@/lib/performance/engine';
import { formatCurrency } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function BenchmarkPage() {
  await requireRole('company');
  const supabase = createClient();

  const { data: dealsData } = await supabase.from('deals').select(
    `id, title, estimated_value_cents,
     counterpart:profiles!counterpart_profile_id(full_name),
     athlete:athlete_profiles!athlete_profile_id(followers_total, engagement_rate, estimated_reach),
     performance:sponsorship_performance(cpm_cents, extra_cost_cents, other_value_cents, reach_override),
     deliverables(status)`,
  );
  const [{ data: allClips }, { data: allLeads }] = await Promise.all([
    supabase.from('media_clippings').select('deal_id, ave_cents'),
    supabase.from('sponsorship_leads').select('deal_id, captured'),
  ]);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = ((dealsData ?? []) as any[]).map((d) => {
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
    return {
      id: d.id,
      name: cp?.full_name ?? d.title,
      score: r.score,
      roas: r.roas,
      impressions: r.impressions,
      ave: aveByDeal[d.id] ?? 0,
      leads: leadsByDeal[d.id] ?? 0,
    };
  });
  rows.sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <Link href="/painel/performance" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar à visão geral
      </Link>
      <PageHeader
        title="Benchmark de patrocínios"
        description="Compare seus patrocínios lado a lado e veja quem lidera em cada dimensão."
      />

      {rows.length === 0 ? (
        <EmptyState title="Sem patrocínios para comparar" description="Assim que houver patrocínios, o comparativo aparece aqui." />
      ) : (
        (() => {
          const maxScore = Math.max(...rows.map((r) => r.score));
          const maxRoas = Math.max(...rows.map((r) => r.roas));
          const maxAve = Math.max(...rows.map((r) => r.ave));
          const maxImpr = Math.max(...rows.map((r) => r.impressions));
          const maxLeads = Math.max(...rows.map((r) => r.leads));
          const leaderScore = rows.find((r) => r.score === maxScore);
          const leaderRoas = rows.find((r) => r.roas === maxRoas);
          const leaderAve = rows.find((r) => r.ave === maxAve);
          const cell = (isLeader: boolean) => (isLeader ? 'font-bold text-primary' : '');
          return (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="flex items-center gap-3 p-5">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Trophy className="h-5 w-5" /></span>
                    <div><p className="text-xs text-muted-foreground">Melhor Score geral</p><p className="font-semibold">{leaderScore?.name}</p><p className="text-sm text-primary">{leaderScore?.score}/100</p></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 p-5">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="h-5 w-5" /></span>
                    <div><p className="text-xs text-muted-foreground">Melhor retorno (ROAS)</p><p className="font-semibold">{leaderRoas?.name}</p><p className="text-sm text-primary">{leaderRoas?.roas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x</p></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 p-5">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Megaphone className="h-5 w-5" /></span>
                    <div><p className="text-xs text-muted-foreground">Maior mídia espontânea</p><p className="font-semibold">{leaderAve?.name}</p><p className="text-sm text-primary">{formatCurrency(leaderAve?.ave ?? 0)}</p></div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Patrocínio</th>
                        <th className="px-4 py-3 text-right font-medium">Score</th>
                        <th className="px-4 py-3 text-right font-medium">ROAS</th>
                        <th className="px-4 py-3 text-right font-medium">Alcance</th>
                        <th className="px-4 py-3 text-right font-medium">AVE mídia</th>
                        <th className="px-4 py-3 text-right font-medium">Leads</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <Link href={`/painel/performance/${r.id}`} className="font-medium hover:underline">{r.name}</Link>
                          </td>
                          <td className={`px-4 py-3 text-right tabular-nums ${cell(r.score === maxScore)}`}>
                            {r.score === maxScore ? <Star className="mr-1 inline h-3 w-3 fill-primary text-primary" /> : null}{r.score}
                          </td>
                          <td className={`px-4 py-3 text-right tabular-nums ${cell(r.roas === maxRoas)}`}>{r.roas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x</td>
                          <td className={`px-4 py-3 text-right tabular-nums ${cell(r.impressions === maxImpr)}`}>{formatCompact(r.impressions)}</td>
                          <td className={`px-4 py-3 text-right tabular-nums ${cell(r.ave === maxAve)}`}>{formatCurrency(r.ave)}</td>
                          <td className={`px-4 py-3 text-right tabular-nums ${cell(r.leads === maxLeads)}`}>{formatCompact(r.leads)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground">★ indica o líder em cada métrica. Clique num patrocínio para abrir o painel detalhado.</p>
            </>
          );
        })()
      )}
    </div>
  );
}
