/** Strip treatment suffixes like "(Borderless Foil)" so fuzzy lookup works */
function cleanCardName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

export function scryfallCardArt(name: string): string {
  const clean = cleanCardName(name);
  return `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(clean)}&format=image&version=art_crop`;
}

export function scryfallSetIcon(setCode: string): string {
  return `https://svgs.scryfall.io/sets/${setCode.toLowerCase()}.svg`;
}

export interface ScryfallSetMeta {
  name: string;
  released_at: string;
}

export async function fetchScryfallSets(): Promise<Record<string, ScryfallSetMeta>> {
  const res = await fetch('https://api.scryfall.com/sets');
  if (!res.ok) throw new Error(`Scryfall sets error: ${res.status}`);
  const data = await res.json();
  const map: Record<string, ScryfallSetMeta> = {};
  for (const set of (data.data ?? []) as { code: string; name: string; released_at: string }[]) {
    map[set.code.toUpperCase()] = { name: set.name, released_at: set.released_at };
  }
  return map;
}
