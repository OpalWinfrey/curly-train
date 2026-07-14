export type ProductType =
  | 'play-booster-box'
  | 'play-booster-case'
  | 'collector-booster-box'
  | 'collector-booster-case'
  | 'draft-booster-box'
  | 'set-booster-box'
  | 'bundle'
  | 'commander-deck'
  | 'secret-lair';

export type Game = 'mtg' | 'pokemon';

export type Recommendation = 'BUY' | 'HOLD' | 'WAIT' | 'SKIP';
export type Rarity = 'M' | 'R' | 'U' | 'C';
export type Condition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG';

export interface CardHit {
  name: string;
  rarity: Rarity;
  price: string;
  pullRate: string;
  pullPct: string;
  evContribution: string;
  artColors: [string, string];
  artInitial: string;
  setName?: string;
  imageUri?: string;
}

export interface IncludedCard {
  name: string;
  rarity: Rarity;
  price: number;
  isFoil?: boolean;
  isBonus?: boolean;
  artColors: [string, string];
  artInitial: string;
}

export interface EVSegment {
  label: string;
  percentage: number;
  amount: string;
  color: string;
}

export interface ScoreBar {
  label: string;
  value: number;
  color: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface PackContents {
  packsPerBox: number;
  cardsPerPack: number;
  raresPerPack: string;
  foilRate: string;
  description?: string;
}

export interface SecretLairMetadata {
  msrpNonfoil?: number;
  msrpFoil?: number;
  isSoldOut: boolean;
  edition: 'foil' | 'nonfoil' | 'both';
  collectorAppeal: number;
  commanderPlayability: number;
  reprintRisk: number;
  liquidity: number;
}

export interface CollectorBoosterMetadata {
  packsPerBox: number;
  guaranteedFoils: string;
  extendedArtSlots: string;
  serializedOdds?: string;
  riskConcentration?: number;
}

export interface Product {
  id: string;
  name: string;
  setName: string;
  setCode: string;
  productType: ProductType;
  game: Game;
  releaseDate: string;
  currentMarketPrice: number;
  priceChangeWeek: number;
  priceChangePct: number;
  priceHistory: PricePoint[];
  expectedValue?: number;
  investmentScore?: number;
  recommendation?: Recommendation;
  recommendationRationale?: string;
  confidence?: number;
  evSegments?: EVSegment[];
  scoreBars?: ScoreBar[];
  playBoosterHits?: CardHit[];
  collectorBoosterHits?: CardHit[];
  includedCards?: IncludedCard[];
  packContents?: PackContents;
  secretLairMetadata?: SecretLairMetadata;
  collectorMetadata?: CollectorBoosterMetadata;
}

export interface CollectionItem {
  id: string;
  productId: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
  condition?: Condition;
}

export interface WatchlistItem {
  id: string;
  productId: string;
  targetPrice: number;
  dateAdded: string;
  notes?: string;
}

export interface LiveEVData {
  expectedValue: number;
  evSegments: Array<EVSegment & { colorKey: string }>;
  topHits: CardHit[];
  cardCounts: { mythics: number; rares: number; treatments: number; specialGuests: number };
  lastUpdated: string;
}
