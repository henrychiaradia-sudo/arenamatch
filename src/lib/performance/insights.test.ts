import { describe, it, expect } from 'vitest';
import {
  generateInsights,
  renewalProbability,
  type DealSummary,
  type ChannelTotals,
} from './insights';

function deal(over: Partial<DealSummary> = {}): DealSummary {
  return {
    id: over.id ?? 'd1',
    name: over.name ?? 'Patrocínio',
    score: over.score ?? 60,
    roas: over.roas ?? 2,
    roiPct: over.roiPct ?? 100,
    investmentCents: over.investmentCents ?? 1_000_000,
    generatedValueCents: over.generatedValueCents ?? 2_000_000,
    impressions: over.impressions ?? 500_000,
    aveCents: over.aveCents ?? 0,
    leads: over.leads ?? 0,
    brandLift: over.brandLift ?? 0,
  };
}

const emptyChannels: ChannelTotals = {
  socialEmvCents: 0,
  earnedAveCents: 0,
  tvAveCents: 0,
  licensingRevenueCents: 0,
};

describe('renewalProbability', () => {
  it('cresce com o score e fica dentro de 5–96%', () => {
    expect(renewalProbability(0)).toBeGreaterThanOrEqual(5);
    expect(renewalProbability(100)).toBeLessThanOrEqual(96);
    expect(renewalProbability(80)).toBeGreaterThan(renewalProbability(40));
  });

  it('nunca retorna abaixo do piso mesmo com score negativo', () => {
    expect(renewalProbability(-50)).toBe(5);
  });
});

describe('generateInsights', () => {
  it('retorna vazio sem patrocínios (não quebra com portfólio vazio)', () => {
    expect(generateInsights([], emptyChannels)).toEqual([]);
  });

  it('elege o melhor patrocínio pelo maior score', () => {
    const deals = [
      deal({ id: 'a', name: 'Alfa', score: 40 }),
      deal({ id: 'b', name: 'Beta', score: 85 }),
    ];
    const out = generateInsights(deals, emptyChannels);
    const best = out.find((i) => i.icon === 'trophy');
    expect(best).toBeTruthy();
    expect(best?.text).toContain('Beta');
  });

  it('sinaliza desperdício quando ROAS < 1 com investimento', () => {
    const deals = [deal({ name: 'Fraco', score: 30, roas: 0.4, investmentCents: 1_000_000 })];
    const out = generateInsights(deals, emptyChannels);
    const warn = out.find((i) => i.icon === 'alert');
    expect(warn).toBeTruthy();
    expect(warn?.tone).toBe('warn');
    expect(warn?.text).toContain('Fraco');
  });

  it('não acusa desperdício quando todos os ROAS são saudáveis', () => {
    const deals = [deal({ roas: 2.5 }), deal({ id: 'd2', roas: 3.1 })];
    const out = generateInsights(deals, emptyChannels);
    expect(out.find((i) => i.icon === 'alert')).toBeUndefined();
  });

  it('identifica o canal de maior valor', () => {
    const ch: ChannelTotals = {
      socialEmvCents: 100_000,
      earnedAveCents: 900_000,
      tvAveCents: 50_000,
      licensingRevenueCents: 0,
    };
    const out = generateInsights([deal()], ch);
    const megaphone = out.find((i) => i.icon === 'megaphone');
    expect(megaphone?.text).toContain('mídia espontânea');
  });

  it('reporta brand lift médio quando há pesquisa', () => {
    const deals = [deal({ brandLift: 8 }), deal({ id: 'd2', brandLift: 4 })];
    const out = generateInsights(deals, emptyChannels);
    const target = out.find((i) => i.icon === 'target');
    expect(target).toBeTruthy();
    expect(target?.tone).toBe('good');
  });

  it('sempre inclui recomendação e probabilidade de renovação', () => {
    const out = generateInsights([deal()], emptyChannels);
    expect(out.find((i) => i.icon === 'lightbulb')).toBeTruthy();
    expect(out.find((i) => i.icon === 'refresh')).toBeTruthy();
  });

  it('produz de 6 a 8 insights num portfólio rico', () => {
    const deals = [
      deal({ id: 'a', name: 'Alfa', score: 82, roas: 3.2, brandLift: 6, leads: 1200 }),
      deal({ id: 'b', name: 'Beta', score: 30, roas: 0.5, brandLift: -2, leads: 40 }),
    ];
    const ch: ChannelTotals = {
      socialEmvCents: 500_000,
      earnedAveCents: 300_000,
      tvAveCents: 200_000,
      licensingRevenueCents: 100_000,
    };
    const out = generateInsights(deals, ch);
    expect(out.length).toBeGreaterThanOrEqual(6);
    expect(out.length).toBeLessThanOrEqual(8);
    // todo insight tem título e texto não vazios
    for (const i of out) {
      expect(i.title.length).toBeGreaterThan(0);
      expect(i.text.length).toBeGreaterThan(0);
    }
  });
});
