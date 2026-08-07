import { Colors } from '../components/tokens';
import type { Product, LiveEVData, Recommendation, ScoreBar } from './types';

export function evRatioScore(ev: number, price: number): number {
  if (price <= 0) return 2;
  const ratio = ev / price;
  if (ratio >= 1.3) return 25;
  if (ratio >= 1.1) return 20;
  if (ratio >= 0.9) return 15;
  if (ratio >= 0.7) return 8;
  return 2;
}

export function setQualityScore(evData: LiveEVData): number {
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

export function chaseCeilingScore(evData: LiveEVData): number {
  const topPrice = evData.topHits[0] ? evData.topHits[0].price : 0;
  if (topPrice >= 50) return 25;
  if (topPrice >= 25) return 18;
  if (topPrice >= 10) return 10;
  return 4;
}

export function timingScore(releaseDate: string): number {
  if (!releaseDate) return 10;
  const months = (Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months >= 3 && months < 12) return 25;
  if (months >= 12 && months < 24) return 18;
  if (months < 3) return 15;
  return 10;
}

export function toRecommendation(score: number): Recommendation {
  if (score >= 70) return 'BUY';
  if (score >= 50) return 'HOLD';
  if (score >= 30) return 'WAIT';
  return 'SKIP';
}

function toRationale(rec: Recommendation, product: Product, evData: LiveEVData, score: number): string {
  const price = product.currentMarketPrice;
  const ev = evData.expectedValue;
  const evRatio = price > 0 ? ev / price : 0;
  const topHit = evData.topHits[0];
  const months = product.releaseDate
    ? Math.round((Date.now() - new Date(product.releaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30.5))
    : null;

  const parts: string[] = [];

  // EV ratio
  if (price <= 0) {
    parts.push('No market price available — check back once pricing data loads.');
  } else if (evRatio >= 1.1) {
    parts.push(`EV ($${ev.toFixed(0)}) beats market price by ${((evRatio - 1) * 100).toFixed(0)}% — rare positive arbitrage on sealed.`);
  } else if (evRatio >= 0.85) {
    parts.push(`EV is ${(evRatio * 100).toFixed(0)}% of market price ($${ev.toFixed(0)} vs $${price.toFixed(0)}) — healthy ratio for sealed.`);
  } else {
    parts.push(`EV ($${ev.toFixed(0)}) is ${(evRatio * 100).toFixed(0)}% of market price — you're paying a sealed premium over singles.`);
  }

  // Chase card
  const pullRateText = topHit && topHit.pullRate !== '0' ? `, 1-in-${topHit.pullRate} packs` : '';
  if (topHit && topHit.price >= 20) {
    parts.push(`Anchored by ${topHit.name} ($${topHit.price.toFixed(2)}${pullRateText}) — a strong ceiling.`);
  } else if (topHit && topHit.price >= 8) {
    parts.push(`Top hit: ${topHit.name} at $${topHit.price.toFixed(2)}${pullRateText}.`);
  } else if (evData.cardCounts.specialGuests > 0) {
    parts.push(`${evData.cardCounts.specialGuests} Special Guest slot${evData.cardCounts.specialGuests > 1 ? 's' : ''} add meaningful upside variance.`);
  } else if (topHit) {
    parts.push(`Best single is ${topHit.name} at $${topHit.price.toFixed(2)} — limited chase appeal.`);
  }

  // Timing
  if (months !== null) {
    if (months < 2) {
      parts.push('Newly released — supply is high; wait for the initial price floor to settle.');
    } else if (months <= 6) {
      parts.push(`${months}mo post-release — early appreciation window; supply still declining.`);
    } else if (months <= 12) {
      parts.push(`${months}mo post-release — typically the sweet spot for sealed price appreciation.`);
    } else if (months <= 24) {
      parts.push(`${months}mo old — supply tightening; moderate upside remains for patient holds.`);
    } else {
      parts.push(`${months}mo old — most sealed appreciation has likely occurred for this set.`);
    }
  }

  // Closing signal
  if (rec === 'BUY') parts.push('Current pricing looks like a solid entry point.');
  else if (rec === 'HOLD') parts.push('Hold existing positions; not the ideal time to add more.');
  else if (rec === 'WAIT') parts.push('Monitor for a better entry price before committing.');
  else parts.push('Consider higher-value alternatives in the catalog.');

  return parts.join(' ');
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
  const rec = toRecommendation(total);

  return {
    investmentScore: total,
    recommendation: rec,
    confidence: total,
    recommendationRationale: toRationale(rec, product, evData, total),
    scoreBars: [
      { label: 'EV Ratio', value: s1 * 4, color: Colors.accent },
      { label: 'Set Quality', value: s2 * 4, color: Colors.success },
      { label: 'Chase Card', value: s3 * 4, color: Colors.accent2 },
      { label: 'Timing', value: s4 * 4, color: Colors.warning },
    ],
  };
}
