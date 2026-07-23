/**
 * Engine de Performance do Patrocínio (Fase 1).
 * Funções puras: calculam métricas financeiras, de alcance e o
 * Sponsor Performance Score (0–100) a partir de dados que a plataforma já tem
 * (investimento do deal, contrapartidas entregues, público do atleta) mais
 * parâmetros calibráveis (CPM, custos, valor de ativações, override de alcance).
 *
 * Tudo é ESTIMADO até que métricas reais sejam inseridas (Fase 2).
 */

export interface PerfInputs {
  investmentCents: number; // deals.estimated_value_cents
  cpmCents: number; // padrão 2200 (R$ 22,00)
  extraCostCents: number; // ativações extras (custo)
  otherValueCents: number; // valor de ativações/eventos além da mídia
  reachOverride: number | null; // alcance total, se informado manualmente
  athleteReachPerDeliverable: number; // estimated_reach do atleta (por entrega)
  engagementRate: number; // % (ex.: 3.5)
  deliveredCount: number;
  totalDeliverables: number;
}

export interface ScoreBreakdown {
  retorno: number; // 0–40
  entrega: number; // 0–25
  alcance: number; // 0–20
  engajamento: number; // 0–15
}

export interface PerfResult {
  investmentCents: number;
  impressions: number;
  emvCents: number;
  generatedValueCents: number;
  roas: number; // múltiplo (x)
  roiPct: number; // percentual
  costPerMilleCents: number; // custo por mil impactos (CPM efetivo pago)
  engagementInteractions: number;
  deliveredCount: number;
  totalDeliverables: number;
  deliveryRate: number; // 0..1
  score: number; // 0..100
  scoreBreakdown: ScoreBreakdown;
}

const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

export function computePerformance(i: PerfInputs): PerfResult {
  const investmentCents = Math.max(0, (i.investmentCents || 0) + (i.extraCostCents || 0));
  const baseReach = Math.max(0, i.athleteReachPerDeliverable || 0);

  const impressions =
    i.reachOverride != null && i.reachOverride > 0
      ? i.reachOverride
      : Math.round(baseReach * Math.max(0, i.deliveredCount));

  const emvCents = Math.round((impressions / 1000) * Math.max(0, i.cpmCents || 0));
  const generatedValueCents = emvCents + Math.max(0, i.otherValueCents || 0);

  const roas = investmentCents > 0 ? generatedValueCents / investmentCents : 0;
  const roiPct = investmentCents > 0 ? ((generatedValueCents - investmentCents) / investmentCents) * 100 : 0;
  const costPerMilleCents = impressions > 0 ? Math.round((investmentCents / impressions) * 1000) : 0;
  const engagementInteractions = Math.round(impressions * (Math.max(0, i.engagementRate || 0) / 100));
  const deliveryRate = i.totalDeliverables > 0 ? i.deliveredCount / i.totalDeliverables : 0;

  // Sponsor Performance Score (0–100) — pesos transparentes e ajustáveis no futuro.
  const retorno = clamp((roas / 3) * 40, 0, 40); // ROAS 3x = 40 pts
  const entrega = clamp(deliveryRate * 25, 0, 25); // 100% entregue = 25 pts
  const alcance = impressions > 0 ? clamp(Math.log10(impressions / 10000) * 10, 0, 20) : 0; // 10k→0, 1M→20
  const engajamento = clamp((Math.max(0, i.engagementRate || 0) / 5) * 15, 0, 15); // 5% = 15 pts
  const score = Math.round(retorno + entrega + alcance + engajamento);

  return {
    investmentCents,
    impressions,
    emvCents,
    generatedValueCents,
    roas,
    roiPct,
    costPerMilleCents,
    engagementInteractions,
    deliveredCount: i.deliveredCount,
    totalDeliverables: i.totalDeliverables,
    deliveryRate,
    score,
    scoreBreakdown: {
      retorno: Math.round(retorno),
      entrega: Math.round(entrega),
      alcance: Math.round(alcance),
      engajamento: Math.round(engajamento),
    },
  };
}

export function scoreLabel(score: number): { label: string; tone: 'good' | 'ok' | 'weak' } {
  if (score >= 70) return { label: 'Excelente', tone: 'good' };
  if (score >= 45) return { label: 'Bom', tone: 'ok' };
  return { label: 'Precisa melhorar', tone: 'weak' };
}

export function renewalSignal(score: number): { label: string; recommend: boolean } {
  return score >= 60
    ? { label: 'Recomendado renovar', recommend: true }
    : { label: 'Reavaliar antes de renovar', recommend: false };
}

/** Formata números grandes no padrão pt-BR: 3.200.000 → "3,2 mi", 112000 → "112 mil". */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  }
  if (Math.abs(n) >= 1_000) {
    return `${Math.round(n / 1_000).toLocaleString('pt-BR')} mil`;
  }
  return n.toLocaleString('pt-BR');
}
