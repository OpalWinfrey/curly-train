import { useEffect, useState } from 'react';

/** Strip treatment suffixes like "(Borderless Foil)" so fuzzy lookup works */
function cleanCardName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

export function scryfallCardArt(name: string): string {
  const clean = cleanCardName(name);
  return `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(clean)}&format=image&version=art_crop`;
}

// Products without a curated "hit" card (all bulk-imported Scryfall/Manapool
// products) fall back to the priciest card in their set as cover art.
// Cached per set code since many products (booster box, bundle, etc.) share one.
const setArtCache = new Map<string, Promise<string | null>>();

function fetchSetArt(setCode: string): Promise<string | null> {
  const key = setCode.toUpperCase();
  let promise = setArtCache.get(key);
  if (!promise) {
    promise = fetch(`https://api.scryfall.com/cards/search?q=e%3A${encodeURIComponent(key)}&order=usd&dir=desc&unique=cards`)
      .then(res => (res.ok ? res.json() : null))
      .then((data: { data?: Array<{ image_uris?: { art_crop?: string }; card_faces?: Array<{ image_uris?: { art_crop?: string } }> }> } | null) => {
        const card = data?.data?.[0];
        return card?.image_uris?.art_crop ?? card?.card_faces?.[0]?.image_uris?.art_crop ?? null;
      })
      .catch(() => null);
    setArtCache.set(key, promise);
  }
  return promise;
}

/** Cover art for a product: the curated hit's card art if present, else the set's priciest card. */
export function useProductArt(setCode: string, hitName?: string): string | null {
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    if (hitName) return;
    let active = true;
    fetchSetArt(setCode).then(url => { if (active) setFallbackUrl(url); });
    return () => { active = false; };
  }, [setCode, hitName]);

  return hitName ? scryfallCardArt(hitName) : fallbackUrl;
}

export function scryfallSetIcon(setCode: string): string {
  return `https://svgs.scryfall.io/sets/${setCode.toLowerCase()}.svg`;
}

export interface ScryfallSetMeta {
  name: string;
  released_at: string;
  set_type: string;
}

export async function fetchScryfallSets(): Promise<Record<string, ScryfallSetMeta>> {
  const res = await fetch('https://api.scryfall.com/sets');
  if (!res.ok) throw new Error(`Scryfall sets error: ${res.status}`);
  const data = await res.json();
  const map: Record<string, ScryfallSetMeta> = {};
  for (const set of (data.data ?? []) as { code: string; name: string; released_at: string; set_type: string }[]) {
    map[set.code.toUpperCase()] = { name: set.name, released_at: set.released_at, set_type: set.set_type };
  }
  return map;
}
