import { describe, it, expect } from 'vitest';
import { parseTags, athleteProfileSchema, companyProfileSchema } from './profile';

describe('parseTags', () => {
  it('divide e limpa a string', () => {
    expect(parseTags('a, b ,c')).toEqual(['a', 'b', 'c']);
  });
  it('retorna vazio para nulo/indefinido', () => {
    expect(parseTags('')).toEqual([]);
    expect(parseTags(undefined)).toEqual([]);
    expect(parseTags(null)).toEqual([]);
  });
});

describe('athleteProfileSchema', () => {
  it('aceita dados mínimos e faz coerção de números', () => {
    const r = athleteProfileSchema.safeParse({ followersTotal: '1000', investmentNeedReais: '2500.50' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.followersTotal).toBe(1000);
      expect(r.data.investmentNeedReais).toBeCloseTo(2500.5);
      expect(r.data.acceptsDirect).toBe(true); // default
    }
  });
});

describe('companyProfileSchema', () => {
  it('rejeita website inválido', () => {
    const r = companyProfileSchema.safeParse({ website: 'nao-e-url' });
    expect(r.success).toBe(false);
  });
  it('aceita website vazio', () => {
    const r = companyProfileSchema.safeParse({ website: '' });
    expect(r.success).toBe(true);
  });
});
