import { describe, it, expect } from 'vitest';
import {
  evRatioScore,
  setQualityScore,
  chaseCeilingScore,
  timingScore,
  toRecommendation,
  computeInvestmentScore,
} from '../data/computeScore';
import type { LiveEVData } from '../data/types';

function makeEVData(overrides: Partial<LiveEVData> = {}): LiveEVData {
  return {
    expectedValue: 100,
    evSegments: [
      { label: 'Mythics', percentage: 40, amount: '$40.00', color: '#f00', colorKey: 'mythics' },
      { label: 'Rares', percentage: 40, amount: '$40.00', color: '#0f0', colorKey: 'rares' },
      { label: 'Bulk', percentage: 20, amount: '$20.00', color: '#00f', colorKey: 'bulk' },
    ],
    topHits: [],
    cardCounts: { mythics: 4, rares: 10, treatments: 2, specialGuests: 0 },
    lastUpdated: '2024-01-01',
    ...overrides,
  };
}

describe('evRatioScore', () => {
  it('returns 25 when ev >= 130% of price', () => {
    expect(evRatioScore(130, 100)).toBe(25);
  });
  it('returns 20 when ev is 110-129% of price', () => {
    expect(evRatioScore(110, 100)).toBe(20);
  });
  it('returns 15 when ev is 90-109% of price', () => {
    expect(evRatioScore(90, 100)).toBe(15);
  });
  it('returns 8 when ev is 70-89% of price', () => {
    expect(evRatioScore(70, 100)).toBe(8);
  });
  it('returns 2 when ev is below 70% of price', () => {
    expect(evRatioScore(50, 100)).toBe(2);
  });
  it('returns 2 when price is zero', () => {
    expect(evRatioScore(100, 0)).toBe(2);
  });
});

describe('setQualityScore', () => {
  it('returns 25 when high-value segments are >= 50% of EV', () => {
    const data = makeEVData({
      expectedValue: 100,
      evSegments: [
        { label: 'Mythics', percentage: 60, amount: '$60.00', color: '#f00', colorKey: 'mythics' },
        { label: 'Bulk', percentage: 40, amount: '$40.00', color: '#00f', colorKey: 'bulk' },
      ],
    });
    expect(setQualityScore(data)).toBe(25);
  });
  it('returns 20 when high-value segments are 35-49%', () => {
    const data = makeEVData({
      expectedValue: 100,
      evSegments: [
        { label: 'Mythics', percentage: 40, amount: '$40.00', color: '#f00', colorKey: 'mythics' },
        { label: 'Bulk', percentage: 60, amount: '$60.00', color: '#00f', colorKey: 'bulk' },
      ],
    });
    expect(setQualityScore(data)).toBe(20);
  });
  it('returns 12 when high-value segments are 20-34%', () => {
    const data = makeEVData({
      expectedValue: 100,
      evSegments: [
        { label: 'Mythics', percentage: 25, amount: '$25.00', color: '#f00', colorKey: 'mythics' },
        { label: 'Bulk', percentage: 75, amount: '$75.00', color: '#00f', colorKey: 'bulk' },
      ],
    });
    expect(setQualityScore(data)).toBe(12);
  });
  it('returns 5 when EV is zero', () => {
    expect(setQualityScore(makeEVData({ expectedValue: 0 }))).toBe(5);
  });
});

describe('chaseCeilingScore', () => {
  it('returns 25 when top card is >= $50', () => {
    const data = makeEVData({ topHits: [{ name: 'Ragavan', rarity: 'M', price: '$75.00', pullRate: '1:20', pullPct: '5%', evContribution: '$3.75', artColors: ['#f00', '#ff0'], artInitial: 'R' }] });
    expect(chaseCeilingScore(data)).toBe(25);
  });
  it('returns 18 when top card is $25-$49', () => {
    const data = makeEVData({ topHits: [{ name: 'Thoughtseize', rarity: 'R', price: '$30.00', pullRate: '1:10', pullPct: '10%', evContribution: '$3.00', artColors: ['#000', '#333'], artInitial: 'T' }] });
    expect(chaseCeilingScore(data)).toBe(18);
  });
  it('returns 10 when top card is $10-$24', () => {
    const data = makeEVData({ topHits: [{ name: 'Counterspell', rarity: 'R', price: '$15.00', pullRate: '1:8', pullPct: '12%', evContribution: '$1.88', artColors: ['#00f', '#0ff'], artInitial: 'C' }] });
    expect(chaseCeilingScore(data)).toBe(10);
  });
  it('returns 4 when no top hits', () => {
    expect(chaseCeilingScore(makeEVData({ topHits: [] }))).toBe(4);
  });
});

describe('timingScore', () => {
  it('returns 10 for empty release date', () => {
    expect(timingScore('')).toBe(10);
  });
  it('returns 15 for a very recent release (< 3 months)', () => {
    const recent = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    expect(timingScore(recent)).toBe(15);
  });
  it('returns 25 for a 3-11 month old release (sweet spot)', () => {
    const sweet = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    expect(timingScore(sweet)).toBe(25);
  });
  it('returns 18 for a 12-23 month old release', () => {
    const old = new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    expect(timingScore(old)).toBe(18);
  });
  it('returns 10 for a very old release (>= 24 months)', () => {
    expect(timingScore('2020-01-01')).toBe(10);
  });
});

describe('toRecommendation', () => {
  it('BUY at 70+', () => expect(toRecommendation(70)).toBe('BUY'));
  it('BUY at 100', () => expect(toRecommendation(100)).toBe('BUY'));
  it('HOLD at 50-69', () => expect(toRecommendation(50)).toBe('HOLD'));
  it('WAIT at 30-49', () => expect(toRecommendation(30)).toBe('WAIT'));
  it('SKIP below 30', () => expect(toRecommendation(29)).toBe('SKIP'));
  it('SKIP at 0', () => expect(toRecommendation(0)).toBe('SKIP'));
});

describe('computeInvestmentScore', () => {
  it('returns a score between 0 and 100 and a valid recommendation', () => {
    const product = {
      id: 'test', name: 'Test Box', setName: 'Test', setCode: 'TST',
      productType: 'play-booster-box' as const, game: 'mtg' as const,
      releaseDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currentMarketPrice: 120,
      priceChangeWeek: 0, priceChangePct: 0, priceHistory: [],
    };
    const evData = makeEVData({
      expectedValue: 150,
      topHits: [{ name: 'Big Card', rarity: 'M', price: '$60.00', pullRate: '1:20', pullPct: '5%', evContribution: '$3.00', artColors: ['#f00', '#ff0'], artInitial: 'B' }],
    });
    const result = computeInvestmentScore(product, evData);
    expect(result.investmentScore).toBeGreaterThan(0);
    expect(result.investmentScore).toBeLessThanOrEqual(100);
    expect(['BUY', 'HOLD', 'WAIT', 'SKIP']).toContain(result.recommendation);
    expect(result.scoreBars).toHaveLength(4);
  });
});
