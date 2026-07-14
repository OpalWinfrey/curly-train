import type { Product, ProductType } from './types';
import type { ManapoolSealedListing } from './manapool';
import type { ScryfallSetMeta } from './scryfall';
import { makeHistory } from './products';

export function inferProductType(name: string): ProductType | null {
  if (name.includes('Collector Booster Box')) return 'collector-booster-box';
  if (name.includes('Set Booster Box')) return 'set-booster-box';
  if (name.includes('Draft Booster Box')) return 'draft-booster-box';
  if (name.includes('Play Booster Box')) return 'play-booster-box';
  if (name.includes('Booster Box')) return 'play-booster-box';
  if (name.includes('Bundle')) return 'bundle';
  if (name.includes('Commander Deck')) return 'commander-deck';
  if (name.includes('Secret Lair')) return 'secret-lair';
  return null;
}

export function buildProductCatalog(
  listings: ManapoolSealedListing[],
  scryfallSets: Record<string, ScryfallSetMeta>,
): Product[] {
  const seen = new Set<string>();
  const products: Product[] = [];

  for (const listing of listings) {
    const { Name, Set } = listing.Sealed;
    const productType = inferProductType(Name);
    if (!productType) continue;

    const setCode = Set.toUpperCase();
    const id = `${setCode.toLowerCase()}-${productType}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const price = listing.PriceCents / 100;
    const setMeta = scryfallSets[setCode];

    products.push({
      id,
      name: Name,
      setName: setMeta?.name ?? setCode,
      setCode,
      productType,
      releaseDate: setMeta?.released_at ?? '',
      currentMarketPrice: price,
      priceChangeWeek: 0,
      priceChangePct: 0,
      priceHistory: makeHistory(price, 'flat'),
    });
  }

  return products;
}
