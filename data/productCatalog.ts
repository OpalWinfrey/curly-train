import type { Product, ProductType } from './types';
import type { ManapoolSealedListing } from './manapool';
import type { ScryfallSetMeta } from './scryfall';
import { makeHistory } from './products';

// Which product types to generate per Scryfall set_type
const SET_TYPE_PRODUCTS: Record<string, { type: ProductType; suffix: string }[]> = {
  expansion: [
    { type: 'play-booster-box', suffix: 'Play Booster Box' },
    { type: 'collector-booster-box', suffix: 'Collector Booster Box' },
    { type: 'bundle', suffix: 'Bundle' },
  ],
  core: [
    { type: 'play-booster-box', suffix: 'Play Booster Box' },
    { type: 'bundle', suffix: 'Bundle' },
  ],
  masters: [
    { type: 'play-booster-box', suffix: 'Play Booster Box' },
    { type: 'collector-booster-box', suffix: 'Collector Booster Box' },
  ],
  draft_innovation: [
    { type: 'play-booster-box', suffix: 'Play Booster Box' },
    { type: 'collector-booster-box', suffix: 'Collector Booster Box' },
  ],
  commander: [
    { type: 'commander-deck', suffix: 'Commander Deck' },
  ],
};

const CATALOG_CUTOFF = '2019-01-01';

export function buildCatalogFromScryfall(
  scryfallSets: Record<string, ScryfallSetMeta>,
): Product[] {
  const products: Product[] = [];
  for (const [setCode, meta] of Object.entries(scryfallSets)) {
    if (!meta.released_at || meta.released_at < CATALOG_CUTOFF) continue;
    const templates = SET_TYPE_PRODUCTS[meta.set_type] ?? [];
    for (const { type, suffix } of templates) {
      const name = `${meta.name} ${suffix}`;
      const id = `${setCode.toLowerCase()}-${nameSlug(name)}`;
      products.push({
        id,
        name,
        setName: meta.name,
        setCode,
        productType: type,
        game: 'mtg',
        releaseDate: meta.released_at,
        currentMarketPrice: 0,
        priceChangeWeek: 0,
        priceChangePct: 0,
        priceHistory: [],
      });
    }
  }
  return products;
}

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

function nameSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function buildProductCatalog(
  listings: ManapoolSealedListing[],
  scryfallSets: Record<string, ScryfallSetMeta>,
): Product[] {
  const seen = new Set<string>();
  const products: Product[] = [];

  for (const listing of listings) {
    const { name, set_code } = listing;
    const productType = inferProductType(name);
    if (!productType) continue;

    // Use name slug to disambiguate same-set products (Secret Lairs, multi-deck sets)
    const setCode = set_code.toUpperCase();
    const id = `${setCode.toLowerCase()}-${nameSlug(name)}`;
    if (seen.has(id)) continue;
    seen.add(id);

    // Skip products with no price — makeHistory would produce negative values
    const priceCents = listing.price_market ?? listing.low_price;
    if (!priceCents || priceCents <= 0) continue;

    const price = priceCents / 100;
    const setMeta = scryfallSets[setCode];

    products.push({
      id,
      name,
      setName: setMeta?.name ?? setCode,
      setCode,
      productType,
      game: 'mtg',
      releaseDate: setMeta?.released_at ?? '',
      currentMarketPrice: price,
      priceChangeWeek: 0,
      priceChangePct: 0,
      priceHistory: makeHistory(price, 'flat'),
    });
  }

  return products;
}
