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
