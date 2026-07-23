import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { PrintButton } from '@/features/performance/print-button';
import { ScoreRing } from '@/features/performance/score-ring';
import { computePerformance, renewalSignal, formatCompact } from '@/lib/performance/engine';
import { summarizeClippings, summarizeLeads, type Clipping, type LeadRow, metricLabel } from '@/lib/performance/media';
import { summarizeTv, summarizeLicensing } from '@/lib/performance/nivelb';
import { formatCurrency } from '@/lib/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(v: any): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? 'font-bold' : 'font-medium'}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="print-avoid-break">
      <h2 className="mb-3 border-b pb-1.5 font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default async function RelatorioPage({ params }: { params: { id: string } }) {
  await requireRole('company');
  const supabase = createClient();

  const { data: deal } = await supabase
    .from('deals')
    .select(
      `id, title, estimated_value_cents,
       counterpart:profiles!counterpart_profile_id(full_name),
       company:company_profiles!company_profile_id(public_name, legal_name),
       athlete:athlete_profiles!athlete_profile_id(followers_total, engagement_rate, estimated_reach),
       performance:sponsorship_performance(cpm_cents, extra_cost_cents, other_value_cents, reach_override)`,
    )
    .eq('id', params.id)
    .maybeSingle();
  if (!deal) notFound();

  const [{ data: delivRows }, { data: clipRows }, { data: surveyRows }, { data: leadRows }, { data: tvRows }, { data: licRows }] =
    await Promise.all([
      supabase.from('deliverables').select('status').eq('deal_id', params.id),
      supabase.from('media_clippings').select('id, outlet_type, outlet_name, title, url, reach, ave_cents, sentiment, published_at').eq('deal_id', params.id),
      supabase.from('brand_surveys').select('metric, before_value, after_value, unit').eq('deal_id', params.id),
      supabase.from('sponsorship_leads').select('id, source, captured, converted').eq('deal_id', params.id),
      supabase.from('tv_exposures').select('exposure_type, seconds, insertions, audience, ave_cents').eq('deal_id', params.id),
      supabase.from('licensing_records').select('product, units_sold, revenue_cents, royalties_cents').eq('deal_id', params.id),
    ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delivs = (delivRows ?? []) as any[];
  const delivered = delivs.filter((d) => d.status === 'completed').length;
  const totalDeliv = delivs.filter((d) => d.status !== 'cancelled').length;

  const athlete = pickOne<{ followers_total: number | null; engagement_rate: number | null; estimated_reach: number | null }>(deal.athlete);
  const perf = pickOne<{ cpm_cents: number; extra_cost_cents: number; other_value_cents: number; reach_override: number | null }>(deal.performance);
  const counterpart = pickOne<{ full_name: string | null }>(deal.counterpart);
  const company = pickOne<{ public_name: string | null; legal_name: string | null }>(deal.company);

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
    totalDeliverables: totalDeliv,
  });
  const renewal = renewalSignal(r.score);

  const cs = summarizeClippings((clipRows ?? []) as Clipping[]);
  const ls = summarizeLeads((leadRows ?? []) as LeadRow[]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tv = summarizeTv((tvRows ?? []) as any[]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lic = summarizeLicensing((licRows ?? []) as any[]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const surveys = (surveyRows ?? []) as any[];

  const emitidoEm = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const verdict =
    r.score >= 70
      ? 'Patrocínio de alta performance. Recomendamos renovar e, se possível, ampliar o investimento.'
      : r.score >= 45
        ? 'Patrocínio com bom desempenho e espaço para otimização. Recomendamos renovar com ajustes nas contrapartidas e ativações.'
        : 'Desempenho abaixo do esperado no período. Recomendamos reavaliar o escopo e as contrapartidas antes de renovar.';

  return (
    <div className="mx-auto max-w-4xl space-y-6 print-page">
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <Link href={`/painel/performance/${params.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao painel
        </Link>
        <PrintButton />
      </div>

      {/* Cabeçalho do relatório */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Relatório de Performance do Patrocínio</p>
          <h1 className="mt-1 font-display text-2xl font-bold">
            {company?.public_name ?? 'Sua marca'} <span className="text-muted-foreground">&times;</span> {counterpart?.full_name ?? deal.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{deal.title} · Emitido em {emitidoEm}</p>
        </div>
        <div className="flex flex-col items-center">
          <ScoreRing score={r.score} size={104} />
        </div>
      </div>

      {/* Resumo executivo */}
      <Section title="Resumo executivo">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Retorno (ROAS)</p><p className="text-xl font-bold text-primary">{r.roas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x</p></div>
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">ROI</p><p className="text-xl font-bold">{r.roiPct >= 0 ? '+' : ''}{Math.round(r.roiPct)}%</p></div>
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Valor gerado</p><p className="text-xl font-bold">{formatCurrency(r.generatedValueCents)}</p></div>
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Recomendação</p><p className={`text-sm font-bold ${renewal.recommend ? 'text-success' : 'text-warning'}`}>{renewal.label}</p></div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{verdict}</p>
      </Section>

      {/* Investimento e retorno */}
      <Section title="Investimento e retorno financeiro">
        <div className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
          <div>
            <Row label="Investimento (contrato + ativações)" value={formatCurrency(r.investmentCents)} />
            <Row label="Valor de mídia equivalente (EMV)" value={formatCurrency(r.emvCents)} />
            <Row label="Ativações / eventos" value={formatCurrency(perf?.other_value_cents ?? 0)} />
          </div>
          <div>
            <Row label="Valor total gerado" value={formatCurrency(r.generatedValueCents)} strong />
            <Row label="Custo por mil impactos" value={formatCurrency(r.costPerMilleCents)} />
            <Row label="Contrapartidas entregues" value={`${delivered} de ${totalDeliv}`} />
          </div>
        </div>
      </Section>

      {/* Exposição */}
      <Section title="Exposição da marca">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Redes / contrapartidas</p>
            <Row label="Alcance estimado" value={`${formatCompact(r.impressions)}`} />
            <Row label="Engajamento" value={`${formatCompact(r.engagementInteractions)}`} />
            <Row label="EMV" value={formatCurrency(r.emvCents)} />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mídia espontânea</p>
            <Row label="Matérias" value={`${cs.total}`} />
            <Row label="Alcance" value={formatCompact(cs.reach)} />
            <Row label="AVE" value={formatCurrency(cs.ave)} />
            <Row label="Sentimento +/=/–" value={`${cs.sentiment.positive}/${cs.sentiment.neutral}/${cs.sentiment.negative}`} />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Televisão</p>
            <Row label="Tempo de marca" value={`${Math.floor(tv.seconds / 60)}min ${tv.seconds % 60}s`} />
            <Row label="Inserções" value={`${tv.insertions}`} />
            <Row label="Audiência" value={formatCompact(tv.audience)} />
            <Row label="Valor equivalente" value={formatCurrency(tv.ave)} />
          </div>
        </div>
      </Section>

      {/* Impacto de marca */}
      {surveys.length > 0 ? (
        <Section title="Impacto de marca (pesquisa)">
          <div className="grid gap-x-10 sm:grid-cols-2">
            {surveys.map((s, i) => {
              const before = Number(s.before_value);
              const after = Number(s.after_value);
              const lift = after - before;
              return (
                <Row
                  key={i}
                  label={metricLabel(s.metric)}
                  value={`${before.toLocaleString('pt-BR')} → ${after.toLocaleString('pt-BR')} ${s.unit} (${lift >= 0 ? '+' : ''}${lift.toLocaleString('pt-BR', { maximumFractionDigits: 1 })})`}
                />
              );
            })}
          </div>
        </Section>
      ) : null}

      {/* Negócio */}
      <Section title="Negócio gerado">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Leads capturados</p><p className="text-lg font-bold">{formatCompact(ls.captured)}</p></div>
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Convertidos</p><p className="text-lg font-bold text-primary">{formatCompact(ls.converted)}</p></div>
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Conversão</p><p className="text-lg font-bold">{ls.rate.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</p></div>
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Receita licenciamento</p><p className="text-lg font-bold">{formatCurrency(lic.revenue)}</p></div>
        </div>
      </Section>

      {/* Conclusão */}
      <Section title="Conclusão e recomendação">
        <p className="text-sm">{verdict}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Sponsor Performance Score: <strong className="text-foreground">{r.score}/100</strong> · composto por retorno financeiro,
          entrega de contrapartidas, alcance e engajamento. Valores de mídia (EMV/AVE) representam o equivalente em publicidade paga,
          não receita direta. Alguns indicadores são estimados a partir do público declarado.
        </p>
      </Section>

      <p className="pt-2 text-center text-xs text-muted-foreground no-print">
        Use o botão “Imprimir / Salvar PDF” no topo e escolha “Salvar como PDF” no destino da impressão.
      </p>
    </div>
  );
}
