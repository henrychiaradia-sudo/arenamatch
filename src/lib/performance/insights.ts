/**
 * Motor de análise automática (Fase 4).
 * Lê os indicadores consolidados do portfólio e gera insights, recomendações
 * e probabilidade de renovação — de forma determinística (sem depender de API
 * externa). Pode ser evoluído para IA generativa (Claude) com uma chave de API.
 */
import { formatCurrency } from '@/lib/format';
import { formatCompact } from '@/lib/performance/engine';

export interface DealSummary {
  id: string;
  name: string;
  score: number;
  roas: number;
  roiPct: number;
  investmentCents: number;
  generatedValueCents: number;
  impressions: number;
  aveCents: number;
  leads: number;
  brandLift: number;
}

export interface ChannelTotals {
  socialEmvCents: number;
  earnedAveCents: number;
  tvAveCents: number;
  licensingRevenueCents: number;
}

export type InsightIcon =
  | 'trophy'
  | 'trending-up'
  | 'alert'
  | 'megaphone'
  | 'refresh'
  | 'target'
  | 'lightbulb'
  | 'coins';

export interface Insight {
  icon: InsightIcon;
  tone: 'good' | 'warn' | 'info';
  title: string;
  text: string;
}

/** Mapeia o Score (0–100) em probabilidade de renovação (%). */
export function renewalProbability(score: number): number {
  return Math.round(Math.max(5, Math.min(96, score * 0.9 + 6)));
}

export function generateInsights(deals: DealSummary[], ch: ChannelTotals): Insight[] {
  const out: Insight[] = [];
  if (deals.length === 0) return out;

  const byScore = [...deals].sort((a, b) => b.score - a.score);
  const byRoas = [...deals].sort((a, b) => b.roas - a.roas);
  const best = byScore[0]!;
  const bestRoas = byRoas[0]!;

  out.push({
    icon: 'trophy',
    tone: 'good',
    title: 'Melhor patrocínio',
    text: `${best.name} lidera com Score ${best.score}/100 e probabilidade de renovação de ${renewalProbability(best.score)}%. Use-o como referência de contrapartidas e ativações.`,
  });

  if (bestRoas.roas > 0) {
    out.push({
      icon: 'trending-up',
      tone: 'good',
      title: 'Maior eficiência de investimento',
      text: `${bestRoas.name} entregou o melhor retorno: ${bestRoas.roas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x sobre o valor investido.`,
    });
  }

  const wasted = deals.filter((d) => d.roas < 1 && d.investmentCents > 0);
  if (wasted.length) {
    const names = wasted
      .slice(0, 3)
      .map((d) => d.name)
      .join(', ');
    out.push({
      icon: 'alert',
      tone: 'warn',
      title: 'Onde há desperdício de verba',
      text: `${wasted.length} patrocínio(s) com retorno abaixo do investido (${names}). Renegocie contrapartidas, reforce ativações ou reduza o aporte no próximo ciclo.`,
    });
  }

  const channels = [
    { label: 'redes sociais', v: ch.socialEmvCents },
    { label: 'mídia espontânea', v: ch.earnedAveCents },
    { label: 'televisão', v: ch.tvAveCents },
    { label: 'licenciamento (receita)', v: ch.licensingRevenueCents },
  ].sort((a, b) => b.v - a.v);
  const topCh = channels[0]!;
  if (topCh.v > 0) {
    out.push({
      icon: 'megaphone',
      tone: 'info',
      title: 'Canal que mais gerou valor',
      text: `O maior valor do portfólio veio de ${topCh.label}: ${formatCurrency(topCh.v)}. Priorize esse canal na próxima negociação.`,
    });
  }

  const withLift = deals.filter((d) => d.brandLift !== 0);
  if (withLift.length) {
    const avgLift = withLift.reduce((s, d) => s + d.brandLift, 0) / withLift.length;
    out.push({
      icon: 'target',
      tone: avgLift >= 0 ? 'good' : 'warn',
      title: 'Impacto na percepção de marca',
      text: `A pesquisa aponta variação média de ${avgLift >= 0 ? '+' : ''}${avgLift.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pts nos indicadores de marca (recall, top of mind, intenção) — o patrocínio impacta além da mídia.`,
    });
  }

  const totalLeads = deals.reduce((s, d) => s + d.leads, 0);
  if (totalLeads > 0) {
    out.push({
      icon: 'coins',
      tone: 'info',
      title: 'Geração de negócio',
      text: `O portfólio gerou ${formatCompact(totalLeads)} leads. Concentre a verba nos patrocínios e origens com melhor conversão para elevar o retorno comercial.`,
    });
  }

  const strong = deals.filter((d) => d.score >= 70).length;
  const weak = deals.filter((d) => d.score < 45).length;
  out.push({
    icon: 'lightbulb',
    tone: 'info',
    title: 'Recomendação para o próximo contrato',
    text: `Mantenha e amplie os ${strong} patrocínio(s) com Score ≥ 70 e renegocie os ${weak} com Score < 45. Concentrar verba nos líderes tende a elevar o ROI do portfólio.`,
  });

  const renew = deals.filter((d) => d.score >= 60).length;
  out.push({
    icon: 'refresh',
    tone: 'good',
    title: 'Probabilidade de renovação',
    text: `${renew} de ${deals.length} patrocínios têm alta probabilidade de renovação (Score ≥ 60). Priorize os contratos por essa ordem.`,
  });

  return out;
}
