import { describe, it, expect } from 'vitest';
import {
  computeAthleteMatch,
  computeProjectMatch,
  matchTier,
  type CompanyMatchProfile,
  type AthleteMatchProfile,
  type ProjectMatchProfile,
} from './engine';

const company: CompanyMatchProfile = {
  sports: ['surfe', 'skate'],
  states: ['SP', 'RJ'],
  minInvestmentCents: 500000,
  maxInvestmentCents: 5000000,
  investmentModel: 'both',
  desiredBenefits: ['social-post', 'events'],
  objectives: ['jovem', 'lifestyle'],
  audienceTags: ['jovem', 'lifestyle'],
};

describe('computeAthleteMatch', () => {
  it('dá score alto para atleta totalmente compatível', () => {
    const athlete: AthleteMatchProfile = {
      sport: 'surfe',
      state: 'SP',
      category: 'profissional',
      investmentNeedCents: 2000000,
      acceptsDirect: true,
      acceptsIncentive: true,
      offeredBenefits: ['social-post', 'events'],
      audienceTags: ['jovem'],
      availableForCampaigns: true,
    };
    const result = computeAthleteMatch(company, athlete);
    expect(result.score).toBe(100);
    expect(result.reasons.every((r) => r.matched)).toBe(true);
  });

  it('penaliza modalidade e região incompatíveis', () => {
    const athlete: AthleteMatchProfile = {
      sport: 'judo',
      state: 'AM',
      category: 'base',
      investmentNeedCents: 20000000,
      acceptsDirect: false,
      acceptsIncentive: false,
      offeredBenefits: [],
      audienceTags: [],
      availableForCampaigns: false,
    };
    const result = computeAthleteMatch(company, athlete);
    expect(result.score).toBeLessThan(50);
  });

  it('mantém o score entre 0 e 100', () => {
    const athlete: AthleteMatchProfile = {
      sport: 'natacao',
      state: 'MG',
      category: 'amador',
      investmentNeedCents: null,
      acceptsDirect: true,
      acceptsIncentive: false,
      offeredBenefits: ['talks'],
      audienceTags: ['saude'],
      availableForCampaigns: true,
    };
    const { score } = computeAthleteMatch(company, athlete);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('computeProjectMatch', () => {
  it('reconhece projeto incentivado compatível', () => {
    const project: ProjectMatchProfile = {
      sport: 'surfe',
      state: 'RJ',
      fundingModel: 'incentive',
      remainingCents: 3000000,
      hasSocialImpact: true,
      objectives: ['lifestyle'],
    };
    const result = computeProjectMatch(company, project);
    expect(result.score).toBeGreaterThanOrEqual(75);
  });
});

describe('matchTier', () => {
  it('classifica faixas corretamente', () => {
    expect(matchTier(90)).toBe('alto');
    expect(matchTier(60)).toBe('medio');
    expect(matchTier(30)).toBe('baixo');
  });
});
