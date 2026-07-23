import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Newspaper,
  TrendingUp,
  Eye,
  Megaphone,
  Heart,
  Wallet,
  Target,
  CheckCircle2,
  Circle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { ScoreRing } from '@/features/performance/score-ring';
import { PerfConfigForm } from '@/features/performance/perf-config-form';
import { computePerformance, renewalSignal, formatCompact } from '@/lib/performance/engine';
import { renewalProbability } from '@/lib/performance/insights';
import { formatCurrency } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </p>
        <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export default async function PerfDetailPage({ params }: { params: { id: string } }) {
  await requireRole('company');
  const supabase = createClient();

  const { data: deal } = await supabase
    .from('deals')
    .select(
      `id, title, status, estimated_value_cents,
       counterpart:profiles!counterpart_profile_id(full_name),
       athlete:athlete_profiles!athlete_profile_id(followers_total, engagement_rate, estimated_reach),
       performance:sponsorship_performance(cpm_cents, extra_cost_cents, other_value_cents, reach_override)`,
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!deal) notFound();

  const { data: delivRows } = await supabase
    .from('deliverables')
    .select('id, title, status')
    .eq('deal_id', params.id)
    .order('created_at', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deliverables = (delivRows ?? []) as any[];
  const delivered = deliverables.filter((d) => d.status === 'completed').length;
  const total = deliverables.filter((d) => d.status !== 'cancelled').length;

  // Fase 2 — resumos de mídia espontânea, pesquisa e leads
  const [{ data: clipAgg }, { data: surveyAgg }, { data: leadAgg }] = await Promise.all([
    supabase.from('media_clippings').select('ave_cents').eq('deal_id', params.id),
    supabase.from('brand_surveys').select('before_value, after_value').eq('deal_id', params.id),
    supabase.from('sponsorship_leads').select('captured').eq('deal_id', params.id),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clipList = (clipAgg ?? []) as any[];
  const aveTotal = clipList.reduce((s, c) => s + Number(c.ave_cents || 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const surveyList = (surveyAgg ?? []) as any[];
  const avgLift = surveyList.length
    ? surveyList.reduce((s, x) => s + (Number(x.after_value) - Number(x.before_value)), 0) / surveyList.length
    : 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leadsCaptured = ((leadAgg ?? []) as any[]).reduce((s, l) => s + Number(l.captured || 0), 0);

  const counterpart = pickOne<{ full_name: string | null }>(deal.counterpart);
  const athlete = pickOne<{
    followers_total: number | null;
    engagement_rate: number | null;
    estimated_reach: number | null;
  }>(deal.athlete);
  const perf = pickOne<{
    cpm_cents: number;
    extra_cost_cents: number;
    other_value_cents: number;
    reach_override: number | null;
  }>(deal.performance);

  const engagementRate = Number(athlete?.engagement_rate ?? 0);
  const reachPer = Number(athlete?.estimated_reach ?? 0) || Number(athlete?.followers_total ?? 0) * 3;

  const r = computePerformance({
    investmentCents: deal.estimated_value_cents ?? 0,
    cpmCents: perf?.cpm_cents ?? 2200,
    extraCostCents: perf?.extra_cost_cents ?? 0,
    otherValueCents: perf?.other_value_cents ?? 0,
    reachOverride: perf?.reach_override ?? null,
    athleteReachPerDeliverable: reachPer,
    engagementRate,
    deliveredCount: delivered,
    totalDeliverables: total,
  });

  const renewal = renewalSignal(r.score);
  const breakdown = [
    { label: 'Retorno financeiro', pts: r.scoreBreakdown.retorno, max: 40 },
    { label: 'Entrega de contrapartidas', pts: r.scoreBreakdown.entrega, max: 25 },
    { label: 'Alcance', pts: r.scoreBreakdown.alcance, max: 20 },
    { label: 'Engajamento', pts: r.scoreBreakdown.engajamento, max: 15 },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/painel/performance"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar à visão geral
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title={`Performance · ${deal.title}`}
          description={counterpart?.full_name ? `Patrocínio com ${counterpart.full_name}` : undefined}
        />
        <div className="flex items-center gap-2">
          <Link
            href={`/painel/performance/${deal.id}/relatorio`}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <FileText className="h-4 w-4" /> Relatório PDF
          </Link>
          <Badge variant="secondary" className="gap-1.5" title="Estimado a partir do público declarado e das contrapartidas. Conecte redes ou insira métricas reais para virar Medido.">
            <RefreshCw className="h-3.5 w-3.5" /> Estimado
          </Badge>
        </div>
      </div>

      {/* Score + destaque financeiro */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sponsor Performance Score
            </p>
            <ScoreRing score={r.score} />
            <Badge variant={renewal.recommend ? 'default' : 'secondary'} className="gap-1">
              {renewal.recommend ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
              {renewal.label}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
              Probabilidade de renovação{' '}
              <strong className="text-foreground">{renewalProbability(r.score)}%</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col justify-center gap-4 p-6">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Retorno (ROAS)</p>
                <p className="font-display text-4xl font-bold text-primary">
                  {r.roas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className="font-display text-4xl font-bold">
                  {r.roiPct >= 0 ? '+' : ''}
                  {Math.round(r.roiPct)}%
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Cada <strong className="text-foreground">R$ 1,00</strong> investido gerou{' '}
              <strong className="text-foreground">
                {(r.generatedValueCents / Math.max(1, r.investmentCents)).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>{' '}
              em valor de mídia e ativações estimados.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiTile icon={Wallet} label="Investimento" value={formatCurrency(r.investmentCents)} hint="Contrato + ativações" />
        <KpiTile icon={Eye} label="Alcance estimado" value={`${formatCompact(r.impressions)}`} hint="Impressões nas contrapartidas" />
        <KpiTile icon={Megaphone} label="Valor de mídia (EMV)" value={formatCurrency(r.emvCents)} hint="Equivalente em anúncios" />
        <KpiTile icon={TrendingUp} label="Valor total gerado" value={formatCurrency(r.generatedValueCents)} hint="Mídia + ativações" />
        <KpiTile icon={Heart} label="Engajamento" value={formatCompact(r.engagementInteractions)} hint={`Interações (${engagementRate.toLocaleString('pt-BR')}%)`} />
        <KpiTile icon={Target} label="Custo por mil impactos" value={formatCurrency(r.costPerMilleCents)} hint="CPM efetivo pago" />
      </div>

      {/* Composição do Score */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold">Composição do Score</h2>
          <p className="mb-4 text-xs text-muted-foreground">Como os {r.score} pontos se formam (pesos ajustáveis).</p>
          <div className="space-y-3">
            {breakdown.map((b) => (
              <div key={b.label} className="grid grid-cols-[180px_1fr_54px] items-center gap-3">
                <span className="text-sm text-muted-foreground">{b.label}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${b.max > 0 ? (b.pts / b.max) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-right text-sm font-semibold tabular-nums">
                  {b.pts}<span className="text-muted-foreground">/{b.max}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contrapartidas + Como calculamos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Contrapartidas entregues</h2>
              <Badge variant="secondary">
                {delivered} de {total} ({total > 0 ? Math.round((delivered / total) * 100) : 0}%)
              </Badge>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">Dado real, rastreado na plataforma.</p>
            <ul className="space-y-1.5">
              {deliverables.slice(0, 8).map((d) => (
                <li key={d.id} className="flex items-center gap-2 text-sm">
                  {d.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={d.status === 'completed' ? '' : 'text-muted-foreground'}>{d.title}</span>
                </li>
              ))}
              {deliverables.length === 0 ? (
                <li className="text-sm text-muted-foreground">Nenhuma contrapartida cadastrada ainda.</li>
              ) : null}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold">Como o valor é calculado</h2>
            <p className="mb-3 text-xs text-muted-foreground">Metodologia transparente — parâmetros calibráveis.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between border-b py-1.5">
                <span className="text-muted-foreground">Alcance estimado</span>
                <span className="font-medium">{formatCompact(r.impressions)} impressões</span>
              </div>
              <div className="flex items-center justify-between border-b py-1.5">
                <span className="text-muted-foreground">CPM (custo por mil)</span>
                <span className="font-medium">{formatCurrency(perf?.cpm_cents ?? 2200)}</span>
              </div>
              <div className="flex items-center justify-between border-b py-1.5">
                <span className="text-muted-foreground">Valor de mídia (EMV)</span>
                <span className="font-medium">{formatCurrency(r.emvCents)}</span>
              </div>
              <div className="flex items-center justify-between border-b py-1.5">
                <span className="text-muted-foreground">+ Ativações/eventos</span>
                <span className="font-medium">{formatCurrency(perf?.other_value_cents ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="font-medium">= Valor gerado</span>
                <span className="font-bold text-success">{formatCurrency(r.generatedValueCents)}</span>
              </div>
            </div>
            <div className="mt-4">
              <PerfConfigForm
                dealId={deal.id}
                cpmReais={(perf?.cpm_cents ?? 2200) / 100}
                extraCostReais={(perf?.extra_cost_cents ?? 0) / 100}
                otherValueReais={(perf?.other_value_cents ?? 0) / 100}
                reachOverride={perf?.reach_override ?? 0}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fase 2 — mídia espontânea, pesquisa e leads */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Newspaper className="h-4 w-4 text-primary" /> Mídia espontânea, pesquisa e leads
            </h2>
            <Link
              href={`/painel/performance/${deal.id}/dados`}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Registrar / ver dados <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Mídia espontânea (AVE)</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(aveTotal)}</p>
              <p className="text-[11px] text-muted-foreground">{clipList.length} matérias registradas</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Brand lift médio</p>
              <p className="text-xl font-bold">
                {avgLift >= 0 ? '+' : ''}
                {avgLift.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pts
              </p>
              <p className="text-[11px] text-muted-foreground">pesquisa antes × depois</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Leads capturados</p>
              <p className="text-xl font-bold">{formatCompact(leadsCaptured)}</p>
              <p className="text-[11px] text-muted-foreground">landing, QR, cupom…</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          Números <strong>estimados</strong> a partir do público declarado do atleta e das contrapartidas
          entregues. Ao inserir métricas reais de cada entrega (Fase 2) ou conectar as redes, o selo passa a{' '}
          <strong>Medido</strong>. Valor de mídia (EMV) ≠ receita — é o equivalente em publicidade paga.
        </p>
      </div>
    </div>
  );
}
