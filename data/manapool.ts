export interface ManapoolSealedListing {
  product_id: string;
  product_type: string;
  language_id: string;
  set_code: string;
  name: string;
  tcgplayer_product_id: number;
  /** Price in USD cents (divide by 100 for dollars). */
  low_price: number | null;
  /** Price in USD cents (divide by 100 for dollars). */
  price_market: number | null;
  available_quantity: number;
  url: string;
}

interface ManapoolSealedResponse {
  meta: { as_of: string };
  data: ManapoolSealedListing[];
}

// Prices above this are implausible for cents (would be $1,000+ per unit) and
// likely mean Manapool started returning dollars instead of cents.
const IMPLAUSIBLE_CENTS_THRESHOLD = 100_000;

export interface ManapoolSingleVariant {
  language_id: string;
  condition_id: string;
  /** NF = non-foil, FO = foil, EF = etched foil. */
  finish_id: string;
  /** Cheapest current listing for this exact (language, condition, finish), in USD cents. */
  low_price: number;
  available_quantity: number;
}

export interface ManapoolSingleListing {
  scryfall_id: string;
  name: string;
  set_code: string;
  number: string;
  url: string;
  variants: ManapoolSingleVariant[];
}

interface ManapoolSinglesResponse {
  meta: { as_of: string };
  data: ManapoolSingleListing[];
}

export interface SinglePriceInfo {
  name: string;
  /** Cheapest current non-foil listing, any condition, in USD cents. Null if none in stock. */
  nonfoilLowCents: number | null;
  /** Cheapest current foil/etched listing, any condition, in USD cents. Null if none in stock. */
  foilLowCents: number | null;
  availableQuantity: number;
}

const FOIL_FINISHES = new Set(['FO', 'EF']);

/** Live prices for specific cards by Scryfall ID (max 100 per call), keyed by scryfall_id. */
export async function fetchSinglePrices(scryfallIds: string[]): Promise<Map<string, SinglePriceInfo>> {
  const result = new Map<string, SinglePriceInfo>();
  if (scryfallIds.length === 0) return result;

  const params = new URLSearchParams();
  for (const id of scryfallIds) params.append('scryfall_ids', id);
  const res = await fetch(`/api/manapool-singles?${params.toString()}`);
  if (!res.ok) throw new Error(`Manapool API error: ${res.status}`);
  const data: ManapoolSinglesResponse = await res.json();

  for (const card of data.data ?? []) {
    const enVariants = card.variants.filter(v => v.language_id === 'EN');
    const nonfoil = enVariants.filter(v => v.finish_id === 'NF');
    const foil = enVariants.filter(v => FOIL_FINISHES.has(v.finish_id));

    const minPrice = (variants: ManapoolSingleVariant[]) =>
      variants.length ? Math.min(...variants.map(v => v.low_price)) : null;

    result.set(card.scryfall_id, {
      name: card.name,
      nonfoilLowCents: minPrice(nonfoil),
      foilLowCents: minPrice(foil),
      availableQuantity: enVariants.reduce((sum, v) => sum + v.available_quantity, 0),
    });
  }

  return result;
}

export async function fetchSealedPrices(): Promise<ManapoolSealedListing[]> {
  const res = await fetch('/api/manapool-prices');
  if (!res.ok) throw new Error(`Manapool API error: ${res.status}`);
  const data: ManapoolSealedResponse = await res.json();
  const listings = (data.data ?? []).filter(l => l.language_id === 'EN');

  if (__DEV__ && listings.length > 0) {
    const [sample] = listings;
    console.log(`[manapool] sample raw price_market=${sample.price_market} for "${sample.name}" (assumed USD cents)`);
    const outlier = listings.find(l => (l.price_market ?? 0) > IMPLAUSIBLE_CENTS_THRESHOLD);
    if (outlier) {
      console.warn(`[manapool] price_market=${outlier.price_market} for "${outlier.name}" exceeds plausible cents range — Manapool may have changed units`);
    }
  }

  return listings;
}
