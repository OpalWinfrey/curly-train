import { Colors, ChartColors } from '../components/tokens';
import type { Product } from './types';

// 7-period price history helpers
export function makeHistory(current: number, trend: 'up' | 'down' | 'flat') {
  const base = current;
  const pts = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const noise = (Math.random() - 0.5) * 6;
    let drift = 0;
    if (trend === 'up') drift = ((29 - i) / 29) * 15;
    if (trend === 'down') drift = -((29 - i) / 29) * 12;
    pts.push({ date: d.toISOString().split('T')[0], price: Math.round((base - 15 + drift + noise) * 100) / 100 });
  }
  pts.push({ date: new Date().toISOString().split('T')[0], price: current });
  return pts;
}

export const PRODUCTS: Product[] = [
  // ─── 1. Tarkir: Dragonstorm — Play Booster Box ───────────────────────────
  {
    id: 'tdm-play-booster-box',
    name: 'Tarkir: Dragonstorm Play Booster Box',
    setName: 'Tarkir: Dragonstorm',
    setCode: 'TDM',
    game: 'mtg',
    productType: 'play-booster-box',
    releaseDate: '2025-04-11',
    currentMarketPrice: 149.99,
    priceChangeWeek: 3.78,
    priceChangePct: 2.59,
    priceHistory: makeHistory(149.99, 'up'),
    expectedValue: 126.74,
    investmentScore: 78,
    recommendation: 'BUY',
    recommendationRationale:
      'Solid buy window. Price sits 12.4% below the 52W high with an 84.5% EV ratio. Ugin anchors the chase slot, supply is tightening post-release, and 30-day momentum is positive.',
    confidence: 78,
    packContents: {
      packsPerBox: 36,
      cardsPerPack: 14,
      raresPerPack: '1–4',
      foilRate: '~33%',
      description: 'Each Play Booster Box contains 36 Play Boosters. Each Play Booster includes 14 Magic cards.',
    },
    evSegments: [
      { label: 'Mythics',        percentage: 19.8, amount: '$25.04', color: ChartColors.mythics },
      { label: 'Rares',          percentage: 28.6, amount: '$36.19', color: ChartColors.rares },
      { label: 'Foils',          percentage: 18.7, amount: '$23.71', color: ChartColors.foils },
      { label: 'Showcase',       percentage: 15.9, amount: '$20.11', color: ChartColors.showcase },
      { label: 'Special Guests', percentage: 8.4,  amount: '$10.64', color: ChartColors.specialGuests },
      { label: 'Bulk & Commons', percentage: 8.6,  amount: '$10.05', color: ChartColors.bulk },
    ],
    scoreBars: [
      { label: 'EV Ratio',  value: 88, color: Colors.success },
      { label: 'Momentum',  value: 76, color: Colors.accent },
      { label: 'Liquidity', value: 82, color: Colors.accent },
      { label: 'Supply',    value: 72, color: Colors.warning },
    ],
    playBoosterHits: [
      { name: 'Ugin, Eye of the Storms',  rarity: 'M', price: '$49.99', pullRate: '295', pullPct: '0.34%', evContribution: '$2.84', artColors: ['#1a3a6a', '#060d1a'], artInitial: 'U', setName: 'Tarkir: Dragonstorm' },
      { name: 'Mardu Siegebreaker',        rarity: 'M', price: '$34.99', pullRate: '275', pullPct: '0.36%', evContribution: '$2.60', artColors: ['#6a1a1a', '#1a0606'], artInitial: 'M', setName: 'Tarkir: Dragonstorm' },
      { name: 'Abuelo, Ancestral Echo',    rarity: 'M', price: '$28.99', pullRate: '310', pullPct: '0.32%', evContribution: '$1.88', artColors: ['#4a4210', '#1a1606'], artInitial: 'A', setName: 'Tarkir: Dragonstorm' },
      { name: 'Elspeth, Storm Slayer',     rarity: 'M', price: '$24.99', pullRate: '340', pullPct: '0.29%', evContribution: '$1.69', artColors: ['#e8e4d0', '#2a2826'], artInitial: 'E', setName: 'Tarkir: Dragonstorm' },
      { name: 'Narset, Jeskai Waymaster',  rarity: 'M', price: '$21.99', pullRate: '370', pullPct: '0.27%', evContribution: '$1.44', artColors: ['#1a2a5a', '#060810'], artInitial: 'N', setName: 'Tarkir: Dragonstorm' },
    ],
  },

  // ─── 2. Tarkir: Dragonstorm — Collector Booster Box ──────────────────────
  {
    id: 'tdm-collector-booster-box',
    name: 'Tarkir: Dragonstorm Collector Booster Box',
    setName: 'Tarkir: Dragonstorm',
    setCode: 'TDM',
    game: 'mtg',
    productType: 'collector-booster-box',
    releaseDate: '2025-04-11',
    currentMarketPrice: 289.99,
    priceChangeWeek: -4.12,
    priceChangePct: -1.40,
    priceHistory: makeHistory(289.99, 'down'),
    expectedValue: 248.80,
    investmentScore: 62,
    recommendation: 'HOLD',
    recommendationRationale:
      'EV is decent at 85.8% but price has been sliding post-release. Strong collector appeal with borderless and extended-art exclusives. Better entry at $265.',
    confidence: 65,
    collectorMetadata: {
      packsPerBox: 12,
      guaranteedFoils: '4+ foil mythics per box',
      extendedArtSlots: '2 extended-art per pack',
      serializedOdds: '1 in ~200 boxes',
      riskConcentration: 68,
    },
    evSegments: [
      { label: 'Foil Mythics',      percentage: 32.4, amount: '$80.61', color: ChartColors.mythics },
      { label: 'Extended Art',      percentage: 24.1, amount: '$59.97', color: ChartColors.showcase },
      { label: 'Borderless',        percentage: 18.3, amount: '$45.53', color: ChartColors.rares },
      { label: 'Foil Rares',        percentage: 14.8, amount: '$36.82', color: ChartColors.foils },
      { label: 'Special Treatments',percentage: 7.2,  amount: '$17.91', color: ChartColors.specialGuests },
      { label: 'Bulk',              percentage: 3.2,  amount: '$7.96',  color: ChartColors.bulk },
    ],
    scoreBars: [
      { label: 'EV Ratio',  value: 68, color: Colors.warning },
      { label: 'Momentum',  value: 48, color: Colors.danger },
      { label: 'Liquidity', value: 74, color: Colors.accent },
      { label: 'Supply',    value: 62, color: Colors.warning },
    ],
    collectorBoosterHits: [
      { name: 'Ugin, Eye of the Storms (Borderless)', rarity: 'M', price: '$89.99', pullRate: '144', pullPct: '0.69%', evContribution: '$6.25', artColors: ['#0a1f4a', '#020810'], artInitial: 'U', setName: 'Tarkir: Dragonstorm' },
      { name: 'Mardu Siegebreaker (Extended Art Foil)',rarity: 'M', price: '$64.99', pullRate: '160', pullPct: '0.63%', evContribution: '$4.06', artColors: ['#5a0a0a', '#1a0202'], artInitial: 'M', setName: 'Tarkir: Dragonstorm' },
      { name: 'Abuelo, Ancestral Echo (Foil)',         rarity: 'M', price: '$52.99', pullRate: '180', pullPct: '0.56%', evContribution: '$2.94', artColors: ['#3a3208', '#0e0e02'], artInitial: 'A', setName: 'Tarkir: Dragonstorm' },
      { name: 'Elspeth, Storm Slayer (Showcase Foil)', rarity: 'M', price: '$44.99', pullRate: '200', pullPct: '0.50%', evContribution: '$2.25', artColors: ['#d8d4c0', '#1a1816'], artInitial: 'E', setName: 'Tarkir: Dragonstorm' },
      { name: 'Narset (Borderless Foil)',               rarity: 'M', price: '$38.99', pullRate: '220', pullPct: '0.45%', evContribution: '$1.77', artColors: ['#0a1a4a', '#020408'], artInitial: 'N', setName: 'Tarkir: Dragonstorm' },
    ],
  },

  // ─── 3. Secret Lair × Global Fund for Women ──────────────────────────────
  {
    id: 'sl-global-fund-for-women',
    name: "Secret Lair × Global Fund for Women: Their Magic Is Limitless",
    setName: 'Secret Lair Drop',
    setCode: 'SLD',
    game: 'mtg',
    productType: 'secret-lair',
    releaseDate: '2024-03-08',
    currentMarketPrice: 74.99,
    priceChangeWeek: 2.10,
    priceChangePct: 2.88,
    priceHistory: makeHistory(74.99, 'up'),
    investmentScore: 71,
    recommendation: 'BUY',
    recommendationRationale:
      'Card singles value significantly exceeds original MSRP. Strong Commander playability across included cards. Reprint risk is low given the charity angle and unique art.',
    confidence: 71,
    secretLairMetadata: {
      msrpNonfoil: 29.99,
      msrpFoil: 39.99,
      isSoldOut: true,
      edition: 'both',
      collectorAppeal: 82,
      commanderPlayability: 78,
      reprintRisk: 28,
      liquidity: 64,
    },
    scoreBars: [
      { label: 'Collector Appeal',     value: 82, color: Colors.accent },
      { label: 'Commander Playability',value: 78, color: Colors.success },
      { label: 'Reprint Risk',         value: 28, color: Colors.success },
      { label: 'Liquidity',            value: 64, color: Colors.warning },
    ],
    includedCards: [
      { name: 'Akroma, Angel of Wrath',  rarity: 'M', price: 18.50, isFoil: false, artColors: ['#f8f0d8', '#2a2010'], artInitial: 'A' },
      { name: "Adrix and Nev, Twincasters", rarity: 'R', price: 12.99, isFoil: false, artColors: ['#0a3a2a', '#020e08'], artInitial: 'A' },
      { name: 'Yeva, Nature\'s Herald',  rarity: 'R', price: 8.49,  isFoil: false, artColors: ['#1a4a10', '#060e02'], artInitial: 'Y' },
      { name: 'Galadriel, Gift-Giver',   rarity: 'R', price: 6.25,  isFoil: false, artColors: ['#e8d8f0', '#201828'], artInitial: 'G' },
      { name: 'Selvala, Heart of the Wilds', rarity: 'M', price: 21.00, isFoil: false, isBonus: true, artColors: ['#2a4a0a', '#080e02'], artInitial: 'S' },
    ],
    evSegments: [
      { label: 'Mythics',  percentage: 58.4, amount: '$39.50', color: ChartColors.mythics },
      { label: 'Rares',    percentage: 41.6, amount: '$27.73', color: ChartColors.rares },
    ],
  },

  // ─── 4. Final Fantasy Play Booster Box ───────────────────────────────────
  {
    id: 'fft-play-booster-box',
    name: 'Final Fantasy Play Booster Box',
    setName: 'Final Fantasy',
    setCode: 'FFT',
    game: 'mtg',
    productType: 'play-booster-box',
    releaseDate: '2025-06-13',
    currentMarketPrice: 179.99,
    priceChangeWeek: 12.50,
    priceChangePct: 7.46,
    priceHistory: makeHistory(179.99, 'up'),
    expectedValue: 141.20,
    investmentScore: 84,
    recommendation: 'BUY',
    recommendationRationale:
      'Massive crossover appeal driving sustained demand. EV ratio is strong at 78.4% and trending upward. Chase mythics carry significant non-MTG fan value.',
    confidence: 84,
    packContents: {
      packsPerBox: 36,
      cardsPerPack: 14,
      raresPerPack: '1–4',
      foilRate: '~33%',
    },
    evSegments: [
      { label: 'Mythics',        percentage: 24.2, amount: '$34.17', color: ChartColors.mythics },
      { label: 'Rares',          percentage: 26.8, amount: '$37.84', color: ChartColors.rares },
      { label: 'Foils',          percentage: 19.4, amount: '$27.39', color: ChartColors.foils },
      { label: 'Showcase',       percentage: 18.6, amount: '$26.26', color: ChartColors.showcase },
      { label: 'Special Guests', percentage: 6.8,  amount: '$9.60',  color: ChartColors.specialGuests },
      { label: 'Bulk & Commons', percentage: 4.2,  amount: '$5.93',  color: ChartColors.bulk },
    ],
    scoreBars: [
      { label: 'EV Ratio',  value: 84, color: Colors.success },
      { label: 'Momentum',  value: 92, color: Colors.success },
      { label: 'Liquidity', value: 88, color: Colors.success },
      { label: 'Supply',    value: 58, color: Colors.warning },
    ],
    playBoosterHits: [
      { name: 'Cloud Strife',      rarity: 'M', price: '$62.99', pullRate: '260', pullPct: '0.38%', evContribution: '$3.85', artColors: ['#1a3060', '#050a1a'], artInitial: 'C', setName: 'Final Fantasy' },
      { name: 'Terra Branford',    rarity: 'M', price: '$48.99', pullRate: '280', pullPct: '0.36%', evContribution: '$2.81', artColors: ['#4a1060', '#100518'], artInitial: 'T', setName: 'Final Fantasy' },
      { name: 'Lightning Farron',  rarity: 'M', price: '$39.99', pullRate: '295', pullPct: '0.34%', evContribution: '$2.16', artColors: ['#601a1a', '#180505'], artInitial: 'L', setName: 'Final Fantasy' },
      { name: 'Tidus',             rarity: 'M', price: '$29.99', pullRate: '320', pullPct: '0.31%', evContribution: '$1.49', artColors: ['#103a60', '#020e18'], artInitial: 'T', setName: 'Final Fantasy' },
      { name: 'Noctis Lucis Caelum',rarity:'M', price: '$24.99', pullRate: '350', pullPct: '0.29%', evContribution: '$1.14', artColors: ['#0a0a1a', '#020206'], artInitial: 'N', setName: 'Final Fantasy' },
    ],
  },

  // ─── 5. Final Fantasy Collector Booster Box ───────────────────────────────
  {
    id: 'fft-collector-booster-box',
    name: 'Final Fantasy Collector Booster Box',
    setName: 'Final Fantasy',
    setCode: 'FFT',
    game: 'mtg',
    productType: 'collector-booster-box',
    releaseDate: '2025-06-13',
    currentMarketPrice: 349.99,
    priceChangeWeek: 18.20,
    priceChangePct: 5.49,
    priceHistory: makeHistory(349.99, 'up'),
    expectedValue: 318.40,
    investmentScore: 79,
    recommendation: 'BUY',
    recommendationRationale:
      'Strong demand from both MTG and Final Fantasy fan communities. Premium treatments command high prices. Supply appears limited.',
    confidence: 79,
    collectorMetadata: {
      packsPerBox: 12,
      guaranteedFoils: '5+ foil mythics per box',
      extendedArtSlots: '3 special treatments per pack',
      riskConcentration: 54,
    },
    evSegments: [
      { label: 'Foil Mythics',       percentage: 38.2, amount: '$121.67', color: ChartColors.mythics },
      { label: 'Full-Art Foils',     percentage: 22.8, amount: '$72.59',  color: ChartColors.showcase },
      { label: 'Borderless',         percentage: 17.4, amount: '$55.40',  color: ChartColors.rares },
      { label: 'Extended Art',       percentage: 13.6, amount: '$43.30',  color: ChartColors.foils },
      { label: 'Special Treatments', percentage: 5.8,  amount: '$18.47',  color: ChartColors.specialGuests },
      { label: 'Bulk',               percentage: 2.2,  amount: '$6.97',   color: ChartColors.bulk },
    ],
    scoreBars: [
      { label: 'EV Ratio',  value: 79, color: Colors.success },
      { label: 'Momentum',  value: 88, color: Colors.success },
      { label: 'Liquidity', value: 82, color: Colors.success },
      { label: 'Supply',    value: 55, color: Colors.warning },
    ],
    collectorBoosterHits: [
      { name: 'Cloud Strife (Full Art Foil)',       rarity: 'M', price: '$124.99', pullRate: '120', pullPct: '0.83%', evContribution: '$10.42', artColors: ['#0e2050', '#020614'], artInitial: 'C', setName: 'Final Fantasy' },
      { name: 'Terra Branford (Borderless Foil)',   rarity: 'M', price: '$92.99',  pullRate: '140', pullPct: '0.71%', evContribution: '$6.64',  artColors: ['#380a50', '#0c0214'], artInitial: 'T', setName: 'Final Fantasy' },
      { name: 'Lightning Farron (Extended Art Foil)',rarity:'M', price: '$72.99',  pullRate: '155', pullPct: '0.65%', evContribution: '$4.71',  artColors: ['#500a0a', '#140202'], artInitial: 'L', setName: 'Final Fantasy' },
      { name: 'Tidus (Showcase Foil)',              rarity: 'M', price: '$54.99',  pullRate: '175', pullPct: '0.57%', evContribution: '$3.14',  artColors: ['#082c50', '#020814'], artInitial: 'T', setName: 'Final Fantasy' },
      { name: 'Noctis (Borderless Foil)',           rarity: 'M', price: '$44.99',  pullRate: '200', pullPct: '0.50%', evContribution: '$2.25',  artColors: ['#080814', '#020204'], artInitial: 'N', setName: 'Final Fantasy' },
    ],
  },

  // ─── 6. Commander Masters Commander Deck ─────────────────────────────────
  {
    id: 'cmm-commander-deck',
    name: 'Commander Masters — Eldrazi Unbound Commander Deck',
    setName: 'Commander Masters',
    setCode: 'CMM',
    game: 'mtg',
    productType: 'commander-deck',
    releaseDate: '2023-08-04',
    currentMarketPrice: 64.99,
    priceChangeWeek: -1.50,
    priceChangePct: -2.26,
    priceHistory: makeHistory(64.99, 'flat'),
    investmentScore: 52,
    recommendation: 'HOLD',
    recommendationRationale:
      'Strong singles value within the deck but low sealed upside. Best value is playing or trading out individual cards. Sealed price has been declining.',
    confidence: 52,
    scoreBars: [
      { label: 'Singles Value', value: 72, color: Colors.success },
      { label: 'Momentum',      value: 38, color: Colors.danger },
      { label: 'Liquidity',     value: 60, color: Colors.warning },
      { label: 'Reprint Risk',  value: 45, color: Colors.warning },
    ],
  },

  // ─── 7. Secret Lair × Fallout ─────────────────────────────────────────────
  {
    id: 'sl-fallout',
    name: 'Secret Lair × Fallout: The Wasteland Survival Guide',
    setName: 'Secret Lair Drop',
    setCode: 'SLD',
    game: 'mtg',
    productType: 'secret-lair',
    releaseDate: '2024-05-13',
    currentMarketPrice: 89.99,
    priceChangeWeek: 5.30,
    priceChangePct: 6.26,
    priceHistory: makeHistory(89.99, 'up'),
    investmentScore: 76,
    recommendation: 'BUY',
    recommendationRationale:
      'Fallout IP drives strong crossover demand. Cards are highly playable in Commander. Sold out, so only available aftermarket, which supports price appreciation.',
    confidence: 76,
    secretLairMetadata: {
      msrpNonfoil: 39.99,
      msrpFoil: 49.99,
      isSoldOut: true,
      edition: 'both',
      collectorAppeal: 88,
      commanderPlayability: 84,
      reprintRisk: 32,
      liquidity: 72,
    },
    scoreBars: [
      { label: 'Collector Appeal',     value: 88, color: Colors.success },
      { label: 'Commander Playability',value: 84, color: Colors.success },
      { label: 'Reprint Risk',         value: 32, color: Colors.success },
      { label: 'Liquidity',            value: 72, color: Colors.accent },
    ],
    includedCards: [
      { name: 'Dogmeat, Ever Loyal',    rarity: 'M', price: 24.99, isFoil: false, artColors: ['#3a2a10', '#0e0a02'], artInitial: 'D' },
      { name: 'Codsworth, Handy Helper',rarity: 'R', price: 14.99, isFoil: false, artColors: ['#3a3828', '#0e0e08'], artInitial: 'C' },
      { name: 'Nick Valentine',         rarity: 'R', price: 11.49, isFoil: false, artColors: ['#282010', '#080602'], artInitial: 'N' },
      { name: 'The Survivor',           rarity: 'R', price: 8.99,  isFoil: false, artColors: ['#204018', '#060c04'], artInitial: 'S' },
      { name: 'Nuka-Cola Vending Machine',rarity:'M',price: 18.50, isFoil: false, isBonus: true, artColors: ['#102060', '#020610'], artInitial: 'N' },
    ],
    evSegments: [
      { label: 'Mythics', percentage: 55.8, amount: '$43.49', color: ChartColors.mythics },
      { label: 'Rares',   percentage: 44.2, amount: '$35.47', color: ChartColors.rares },
    ],
  },
  // ─── 8. Pokemon — Prismatic Evolutions Elite Trainer Box ─────────────────
  {
    id: 'sv8a-prismatic-evolutions-etb',
    name: 'Prismatic Evolutions Elite Trainer Box',
    setName: 'Prismatic Evolutions',
    setCode: 'SV8A',
    game: 'pokemon',
    productType: 'bundle',
    releaseDate: '2025-01-17',
    currentMarketPrice: 89.99,
    priceChangeWeek: 4.50,
    priceChangePct: 5.27,
    priceHistory: makeHistory(89.99, 'up'),
    expectedValue: 74.20,
    investmentScore: 81,
    recommendation: 'BUY',
    recommendationRationale:
      'Eevee-lution demand drives consistent secondary market premiums. Special Illustration Rares for Umbreon and Espeon are among the most sought-after Pokemon cards in years. ETBs sell out at retail regularly.',
    confidence: 81,
    packContents: {
      packsPerBox: 9,
      cardsPerPack: 10,
      raresPerPack: '1+',
      foilRate: '~20%',
      description: 'Each Prismatic Evolutions ETB contains 9 booster packs, 65 card sleeves, a coin, and damage counters.',
    },
    evSegments: [
      { label: 'Spec. Illus. Rares', percentage: 42.8, amount: '$31.74', color: ChartColors.mythics },
      { label: 'Illus. Rares',       percentage: 24.3, amount: '$18.02', color: ChartColors.showcase },
      { label: 'ex Cards',           percentage: 18.6, amount: '$13.80', color: ChartColors.rares },
      { label: 'Holos & Reverses',   percentage: 9.1,  amount: '$6.75',  color: ChartColors.foils },
      { label: 'Bulk',               percentage: 5.2,  amount: '$3.86',  color: ChartColors.bulk },
    ],
    scoreBars: [
      { label: 'EV Ratio',  value: 82, color: Colors.success },
      { label: 'Momentum',  value: 88, color: Colors.success },
      { label: 'Liquidity', value: 90, color: Colors.success },
      { label: 'Supply',    value: 42, color: Colors.danger },
    ],
    playBoosterHits: [
      { name: 'Umbreon ex',  rarity: 'M', price: '$89.99', pullRate: '63',  pullPct: '1.59%', evContribution: '$9.19', artColors: ['#1a1a2e', '#0a0a18'], artInitial: 'U', setName: 'Prismatic Evolutions', imageUri: 'https://images.pokemontcg.io/sv8a/215_hires.png' },
      { name: 'Espeon ex',   rarity: 'M', price: '$54.99', pullRate: '72',  pullPct: '1.39%', evContribution: '$5.15', artColors: ['#3d1a6e', '#1a0a2e'], artInitial: 'E', setName: 'Prismatic Evolutions', imageUri: 'https://images.pokemontcg.io/sv8a/213_hires.png' },
      { name: 'Sylveon ex',  rarity: 'M', price: '$44.99', pullRate: '90',  pullPct: '1.11%', evContribution: '$3.37', artColors: ['#6e1a3a', '#2e0a18'], artInitial: 'S', setName: 'Prismatic Evolutions', imageUri: 'https://images.pokemontcg.io/sv8a/218_hires.png' },
      { name: 'Vaporeon ex', rarity: 'M', price: '$34.99', pullRate: '108', pullPct: '0.93%', evContribution: '$2.22', artColors: ['#1a4a6e', '#0a1e2e'], artInitial: 'V', setName: 'Prismatic Evolutions', imageUri: 'https://images.pokemontcg.io/sv8a/220_hires.png' },
      { name: 'Jolteon ex',  rarity: 'M', price: '$28.99', pullRate: '108', pullPct: '0.93%', evContribution: '$1.83', artColors: ['#6e5a1a', '#2e260a'], artInitial: 'J', setName: 'Prismatic Evolutions', imageUri: 'https://images.pokemontcg.io/sv8a/214_hires.png' },
    ],
  },

  // ─── 9. Pokemon — Surging Sparks Booster Box ─────────────────────────────
  {
    id: 'sv8-surging-sparks-booster-box',
    name: 'Surging Sparks Booster Box',
    setName: 'Surging Sparks',
    setCode: 'SV8',
    game: 'pokemon',
    productType: 'play-booster-box',
    releaseDate: '2024-11-08',
    currentMarketPrice: 129.99,
    priceChangeWeek: -2.80,
    priceChangePct: -2.11,
    priceHistory: makeHistory(129.99, 'flat'),
    expectedValue: 108.50,
    investmentScore: 69,
    recommendation: 'HOLD',
    recommendationRationale:
      'Pikachu ex SIR is the set\'s clear chase card and commands a strong premium. EV ratio is healthy but price has softened post-release. Best entry around $115.',
    confidence: 69,
    packContents: {
      packsPerBox: 36,
      cardsPerPack: 10,
      raresPerPack: '1+',
      foilRate: '~20%',
      description: 'Each Surging Sparks Booster Box contains 36 booster packs, each with 10 cards.',
    },
    evSegments: [
      { label: 'Spec. Illus. Rares', percentage: 38.4, amount: '$41.66', color: ChartColors.mythics },
      { label: 'Illus. Rares',       percentage: 22.7, amount: '$24.63', color: ChartColors.showcase },
      { label: 'ex Cards',           percentage: 21.3, amount: '$23.11', color: ChartColors.rares },
      { label: 'Holos & Reverses',   percentage: 11.8, amount: '$12.80', color: ChartColors.foils },
      { label: 'Bulk',               percentage: 5.8,  amount: '$6.30',  color: ChartColors.bulk },
    ],
    scoreBars: [
      { label: 'EV Ratio',  value: 70, color: Colors.accent },
      { label: 'Momentum',  value: 52, color: Colors.warning },
      { label: 'Liquidity', value: 78, color: Colors.success },
      { label: 'Supply',    value: 68, color: Colors.accent },
    ],
    playBoosterHits: [
      { name: 'Pikachu ex',      rarity: 'M', price: '$74.99', pullRate: '288', pullPct: '0.35%', evContribution: '$9.37', artColors: ['#6e5a0a', '#2e260a'], artInitial: 'P', setName: 'Surging Sparks', imageUri: 'https://images.pokemontcg.io/sv8/251_hires.png' },
      { name: 'Dragapult ex',    rarity: 'M', price: '$44.99', pullRate: '360', pullPct: '0.28%', evContribution: '$4.22', artColors: ['#1a2e1a', '#0a160a'], artInitial: 'D', setName: 'Surging Sparks', imageUri: 'https://images.pokemontcg.io/sv8/232_hires.png' },
      { name: 'Iron Thorns ex',  rarity: 'M', price: '$29.99', pullRate: '432', pullPct: '0.23%', evContribution: '$2.34', artColors: ['#2e2a1a', '#120e06'], artInitial: 'I', setName: 'Surging Sparks', imageUri: 'https://images.pokemontcg.io/sv8/240_hires.png' },
      { name: 'Raichu ex',       rarity: 'M', price: '$22.99', pullRate: '432', pullPct: '0.23%', evContribution: '$1.79', artColors: ['#6e3a0a', '#2e180a'], artInitial: 'R', setName: 'Surging Sparks', imageUri: 'https://images.pokemontcg.io/sv8/238_hires.png' },
      { name: 'Terapagos ex',    rarity: 'M', price: '$18.99', pullRate: '504', pullPct: '0.20%', evContribution: '$1.27', artColors: ['#1a3a6e', '#0a162e'], artInitial: 'T', setName: 'Surging Sparks', imageUri: 'https://images.pokemontcg.io/sv8/245_hires.png' },
    ],
  },

  // ─── 10. Pokemon — Stellar Crown Booster Box ──────────────────────────────
  {
    id: 'sv7-stellar-crown-booster-box',
    name: 'Stellar Crown Booster Box',
    setName: 'Stellar Crown',
    setCode: 'SV7',
    game: 'pokemon',
    productType: 'play-booster-box',
    releaseDate: '2024-09-13',
    currentMarketPrice: 109.99,
    priceChangeWeek: 1.20,
    priceChangePct: 1.10,
    priceHistory: makeHistory(109.99, 'flat'),
    expectedValue: 88.30,
    investmentScore: 58,
    recommendation: 'WAIT',
    recommendationRationale:
      'EV ratio of 80.3% is below average. No single chase card dominates the set. Good as a casual opening product but sealed investment upside is limited at current prices.',
    confidence: 58,
    packContents: {
      packsPerBox: 36,
      cardsPerPack: 10,
      raresPerPack: '1+',
      foilRate: '~20%',
      description: 'Each Stellar Crown Booster Box contains 36 booster packs, each with 10 cards.',
    },
    evSegments: [
      { label: 'Spec. Illus. Rares', percentage: 33.6, amount: '$29.67', color: ChartColors.mythics },
      { label: 'Illus. Rares',       percentage: 24.9, amount: '$21.99', color: ChartColors.showcase },
      { label: 'ex Cards',           percentage: 22.8, amount: '$20.13', color: ChartColors.rares },
      { label: 'Holos & Reverses',   percentage: 12.4, amount: '$10.95', color: ChartColors.foils },
      { label: 'Bulk',               percentage: 6.3,  amount: '$5.56',  color: ChartColors.bulk },
    ],
    scoreBars: [
      { label: 'EV Ratio',  value: 58, color: Colors.warning },
      { label: 'Momentum',  value: 50, color: Colors.warning },
      { label: 'Liquidity', value: 72, color: Colors.accent },
      { label: 'Supply',    value: 74, color: Colors.accent },
    ],
    playBoosterHits: [
      { name: 'Terapagos ex',    rarity: 'M', price: '$54.99', pullRate: '288', pullPct: '0.35%', evContribution: '$6.47', artColors: ['#0e2a5a', '#040e1e'], artInitial: 'T', setName: 'Stellar Crown', imageUri: 'https://images.pokemontcg.io/sv7/168_hires.png' },
      { name: 'Ceruledge ex',    rarity: 'M', price: '$34.99', pullRate: '360', pullPct: '0.28%', evContribution: '$3.28', artColors: ['#3a0a0a', '#180202'], artInitial: 'C', setName: 'Stellar Crown', imageUri: 'https://images.pokemontcg.io/sv7/160_hires.png' },
      { name: 'Gardevoir ex',    rarity: 'M', price: '$24.99', pullRate: '432', pullPct: '0.23%', evContribution: '$1.95', artColors: ['#4a1a4a', '#1e0a1e'], artInitial: 'G', setName: 'Stellar Crown', imageUri: 'https://images.pokemontcg.io/sv7/162_hires.png' },
      { name: 'Arcanine ex',     rarity: 'M', price: '$19.99', pullRate: '432', pullPct: '0.23%', evContribution: '$1.56', artColors: ['#6e2a0a', '#2e100a'], artInitial: 'A', setName: 'Stellar Crown', imageUri: 'https://images.pokemontcg.io/sv7/158_hires.png' },
      { name: 'Wugtrio ex',      rarity: 'M', price: '$14.99', pullRate: '504', pullPct: '0.20%', evContribution: '$1.00', artColors: ['#0a4a4a', '#021e1e'], artInitial: 'W', setName: 'Stellar Crown', imageUri: 'https://images.pokemontcg.io/sv7/164_hires.png' },
    ],
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductsByType(type: Product['productType']): Product[] {
  return PRODUCTS.filter(p => p.productType === type);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.setName.toLowerCase().includes(q) ||
    p.setCode.toLowerCase().includes(q)
  );
}
