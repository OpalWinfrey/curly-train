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
