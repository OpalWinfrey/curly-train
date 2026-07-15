import type { Product, LiveEVData, Recommendation, ScoreBar } from './types';

function evRatioScore(ev: number, price: number): number {
  if (price <= 0) return 2;
  const ratio = ev / price;
  if (ratio >= 1.3) return 25;
  if (ratio >= 1.1) return 20;
  if (ratio >= 0.9) return 15;
  if (ratio >= 0.7) return 8;
  return 2;
}

function setQualityScore(evData: LiveEVData): number {
  const total = evData.expectedValue;
  if (total <= 0) return 5;
  const highValueAmt = evData.evSegments
    .filter(s => ['mythics', 'showcase', 'specialGuests'].includes(s.colorKey))
    .reduce((sum, s) => sum + parseFloat(s.amount.replace('$', '')), 0);
  const pct = (highValueAmt / total) * 100;
  if (pct >= 50) return 25;
  if (pct >= 35) return 20;
  if (pct >= 20) return 12;
  return 5;
}

function chaseCeilingScore(evData: LiveEVData): number {
  const topPrice = evData.topHits[0] ? parseFloat(evData.topHits[0].price.replace('$', '')) : 0;
  if (topPrice >= 50) return 25;
  if (topPrice >= 25) return 18;
  if (topPrice >= 10) return 10;
  return 4;
}

function timingScore(releaseDate: string): number {
  if (!releaseDate) return 10;
  const months = (Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months >= 3 && months < 12) return 25;
  if (months >= 12 && months < 24) return 18;
  if (months < 3) return 15;
  return 10;
}

function toRecommendation(score: number): Recommendation {
  if (score >= 70) return 'BUY';
  if (score >= 50) return 'HOLD';
  if (score >= 30) return 'WAIT';
  return 'SKIP';
}

function toRationale(rec: Recommendation, evRatio: number, score: number): string {
  const ratioStr = evRatio > 0 ? ` EV is ${(evRatio * 100).toFixed(0)}% of market price.` : '';
  if (rec === 'BUY') return `Strong fundamentals — score ${score}/100.${ratioStr} Good entry point based on current pricing.`;
  if (rec === 'HOLD') return `Moderate fundamentals — score ${score}/100.${ratioStr} Hold and monitor for price movement.`;
  if (rec === 'WAIT') return `Weak fundamentals — score ${score}/100.${ratioStr} Wait for a better entry price or more data.`;
  return `Poor fundamentals — score ${score}/100.${ratioStr} Consider other products with stronger value.`;
}

export function computeInvestmentScore(
  product: Product,
  evData: LiveEVData,
): {
  investmentScore: number;
  recommendation: Recommendation;
  confidence: number;
  recommendationRationale: string;
  scoreBars: ScoreBar[];
} {
  const s1 = evRatioScore(evData.expectedValue, product.currentMarketPrice);
  const s2 = setQualityScore(evData);
  const s3 = chaseCeilingScore(evData);
  const s4 = timingScore(product.releaseDate);
  const total = s1 + s2 + s3 + s4;
  const evRatio = product.currentMarketPrice > 0 ? evData.expectedValue / product.currentMarketPrice : 0;
  const rec = toRecommendation(total);

  return {
    investmentScore: total,
    recommendation: rec,
    confidence: total,
    recommendationRationale: toRationale(rec, evRatio, total),
    scoreBars: [
      { label: 'EV Ratio', value: s1 * 4, color: '#8B5CF6' },
      { label: 'Set Quality', value: s2 * 4, color: '#10B981' },
      { label: 'Chase Card', value: s3 * 4, color: '#D4A843' },
      { label: 'Timing', value: s4 * 4, color: '#F59E0B' },
    ],
  };
}
