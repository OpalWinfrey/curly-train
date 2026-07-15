// ── Scryfall card shape (only the fields we need) ──────────────────────────
interface ScryfallCard {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  frame_effects?: string[];
  promo_types?: string[];
  prices: { usd?: string | null; usd_foil?: string | null };
  image_uris?: { art_crop?: string };
  card_faces?: Array<{ image_uris?: { art_crop?: string } }>;
}

interface ScryfallPage {
  data: ScryfallCard[];
  has_more: boolean;
  next_page?: string;
}

interface SlotModel {
  PACKS: number; MYTHIC_RATE: number; RARE_RATE: number;
  FOIL_PER_BOX: number; FOIL_RARE_RATE: number; FOIL_MYTHIC_RATE: number;
  TREATMENT_PER_BOX: number; SPECIAL_GUEST_PER_BOX: number; BULK_EV_PER_BOX: number;
  // Serialized cards are extremely rare bonus inserts: ~1 per case (6 boxes) for CBBs
  SERIALIZED_PER_BOX: number;
}

function getSlotModel(productType: string): SlotModel {
  if (productType.startsWith('collector-booster')) {
    return {
      PACKS: 12, MYTHIC_RATE: 1 / 8, RARE_RATE: 7 / 8,
      FOIL_PER_BOX: 48, FOIL_RARE_RATE: 0.30, FOIL_MYTHIC_RATE: 0.10,
      TREATMENT_PER_BOX: 24, SPECIAL_GUEST_PER_BOX: 12 / 20, BULK_EV_PER_BOX: 2.50,
      SERIALIZED_PER_BOX: 1 / 6, // ~1 serialized card per case (6 boxes)
    };
  }
  if (productType === 'bundle') {
    return {
      PACKS: 10, MYTHIC_RATE: 1 / 8, RARE_RATE: 7 / 8,
      FOIL_PER_BOX: 10, FOIL_RARE_RATE: 0.085, FOIL_MYTHIC_RATE: 0.02,
      TREATMENT_PER_BOX: 10 / 7, SPECIAL_GUEST_PER_BOX: 10 / 45, BULK_EV_PER_BOX: 2.50,
      SERIALIZED_PER_BOX: 0,
    };
  }
  return {
    PACKS: 36, MYTHIC_RATE: 1 / 8, RARE_RATE: 7 / 8,
    FOIL_PER_BOX: 36, FOIL_RARE_RATE: 0.085, FOIL_MYTHIC_RATE: 0.02,
    TREATMENT_PER_BOX: 36 / 7, SPECIAL_GUEST_PER_BOX: 36 / 45, BULK_EV_PER_BOX: 8.50,
    SERIALIZED_PER_BOX: 0,
  };
}

// 8 deterministic color pairs for card art gradients (dark bg, accent)
const ART_COLOR_PAIRS: [string, string][] = [
  ['#1a3a6a', '#060d1a'],
  ['#6a1a1a', '#1a0606'],
  ['#1a4a1a', '#061006'],
  ['#4a1a6a', '#0d0618'],
  ['#4a3a10', '#120e03'],
  ['#1a3a4a', '#060d12'],
  ['#6a4a1a', '#1a1206'],
  ['#3a1a4a', '#0a0612'],
];

function artColors(name: string): [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ART_COLOR_PAIRS[h % ART_COLOR_PAIRS.length];
}

function isSerializedCard(card: ScryfallCard): boolean {
  return (card.promo_types ?? []).includes('serialized');
}

function isTreatment(card: ScryfallCard): boolean {
  const fe = card.frame_effects ?? [];
  const pt = card.promo_types ?? [];
  return (
    fe.includes('showcase') ||
    fe.includes('extendedart') ||
    fe.includes('borderless') ||
    pt.includes('boosterfun') ||
    pt.includes('buyabox')
  );
}

function isSpecialGuest(card: ScryfallCard): boolean {
  return (card.promo_types ?? []).includes('specialguest');
}

function cardArt(card: ScryfallCard): string | undefined {
  return card.image_uris?.art_crop ?? card.card_faces?.[0]?.image_uris?.art_crop;
}

function usd(s: string | null | undefined): number {
  if (!s) return 0;
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

async function fetchAllCards(setCode: string): Promise<ScryfallCard[]> {
  const cards: ScryfallCard[] = [];
  let url: string | undefined =
    `https://api.scryfall.com/cards/search?q=e%3A${encodeURIComponent(setCode)}+not%3Adigital&order=usd&dir=desc&unique=prints`;

  while (url) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VaultMark/1.0', Accept: 'application/json' },
    });
    if (!res.ok) break;
    const page: ScryfallPage = await res.json();
    cards.push(...page.data);
    url = page.has_more ? page.next_page : undefined;
    if (url) await new Promise(r => setTimeout(r, 100)); // respect Scryfall rate limits
  }
  return cards;
}

export default async function handler(req: any, res: any) {
  const setCode = (req.query.setCode as string | undefined)?.toUpperCase();
  if (!setCode) {
    res.status(400).json({ error: 'Missing setCode' });
    return;
  }

  const productType = ((req.query.productType as string | undefined) ?? 'play-booster-box').toLowerCase();
  const {
    PACKS, MYTHIC_RATE, RARE_RATE, FOIL_PER_BOX, FOIL_RARE_RATE, FOIL_MYTHIC_RATE,
    TREATMENT_PER_BOX, SPECIAL_GUEST_PER_BOX, BULK_EV_PER_BOX, SERIALIZED_PER_BOX,
  } = getSlotModel(productType);

  let cards: ScryfallCard[];
  try {
    cards = await fetchAllCards(setCode);
  } catch {
    res.status(502).json({ error: 'Scryfall fetch failed' });
    return;
  }

  if (cards.length === 0) {
    res.status(404).json({ error: 'No cards found for set' });
    return;
  }

  // ── Bucket cards ───────────────────────────────────────────────────────────
  const mythics: ScryfallCard[] = [];
  const rares: ScryfallCard[] = [];
  const treatments: ScryfallCard[] = [];
  const specialGuests: ScryfallCard[] = [];
  const serializedCards: ScryfallCard[] = [];

  for (const card of cards) {
    // Serialized cards must be checked first — they often also have boosterfun/showcase
    // promo_types, and they belong in their own low-odds bucket, not the treatment pool.
    if (isSerializedCard(card)) { serializedCards.push(card); continue; }
    if (isSpecialGuest(card)) { specialGuests.push(card); continue; }
    if (isTreatment(card)) { treatments.push(card); continue; }
    if (card.rarity === 'mythic') mythics.push(card);
    else if (card.rarity === 'rare') rares.push(card);
  }

  // ── Per-card EV helpers ────────────────────────────────────────────────────
  function mythicEVContrib(card: ScryfallCard): number {
    if (mythics.length === 0) return 0;
    return (PACKS * MYTHIC_RATE / mythics.length) * usd(card.prices.usd);
  }

  function rareEVContrib(card: ScryfallCard): number {
    if (rares.length === 0) return 0;
    return (PACKS * RARE_RATE / rares.length) * usd(card.prices.usd);
  }

  function treatmentEVContrib(card: ScryfallCard): number {
    if (treatments.length === 0) return 0;
    return (TREATMENT_PER_BOX / treatments.length) * usd(card.prices.usd);
  }

  function specialGuestEVContrib(card: ScryfallCard): number {
    if (specialGuests.length === 0) return 0;
    return (SPECIAL_GUEST_PER_BOX / specialGuests.length) * usd(card.prices.usd);
  }

  function serializedEVContrib(card: ScryfallCard): number {
    if (serializedCards.length === 0 || SERIALIZED_PER_BOX === 0) return 0;
    return (SERIALIZED_PER_BOX / serializedCards.length) * usd(card.prices.usd);
  }

  // ── Segment EVs ───────────────────────────────────────────────────────────
  const mythicEV = mythics.reduce((s, c) => s + mythicEVContrib(c), 0);
  const rareEV = rares.reduce((s, c) => s + rareEVContrib(c), 0);
  const treatmentEV = treatments.reduce((s, c) => s + treatmentEVContrib(c), 0);
  const specialGuestEV = specialGuests.reduce((s, c) => s + specialGuestEVContrib(c), 0);
  const serializedEV = serializedCards.reduce((s, c) => s + serializedEVContrib(c), 0);

  // Foil EV: use foil prices where available, fall back to non-foil
  const allNonSpecial = [...mythics, ...rares];
  const avgFoilRarePrice = avg(
    rares.map(c => usd(c.prices.usd_foil) || usd(c.prices.usd) * 1.15),
  );
  const avgFoilMythicPrice = avg(
    mythics.map(c => usd(c.prices.usd_foil) || usd(c.prices.usd) * 1.2),
  );
  const foilEV =
    FOIL_PER_BOX * FOIL_RARE_RATE * avgFoilRarePrice +
    FOIL_PER_BOX * FOIL_MYTHIC_RATE * avgFoilMythicPrice;

  const totalEV = mythicEV + rareEV + foilEV + treatmentEV + specialGuestEV + serializedEV + BULK_EV_PER_BOX;

  // ── evSegments (only include segments with >0 EV) ─────────────────────────
  const rawSegments = [
    { label: 'Mythics',        ev: mythicEV,       colorKey: 'mythics' },
    { label: 'Rares',          ev: rareEV,         colorKey: 'rares' },
    { label: 'Foils',          ev: foilEV,         colorKey: 'foils' },
    { label: 'Showcase',       ev: treatmentEV,    colorKey: 'showcase' },
    { label: 'Special Guests', ev: specialGuestEV, colorKey: 'specialGuests' },
    { label: 'Serialized',     ev: serializedEV,   colorKey: 'serialized' },
    { label: 'Bulk & Commons', ev: BULK_EV_PER_BOX, colorKey: 'bulk' },
  ].filter(s => s.ev > 0.01);

  const evSegments = rawSegments.map(s => ({
    label: s.label,
    percentage: totalEV > 0 ? parseFloat(((s.ev / totalEV) * 100).toFixed(1)) : 0,
    amount: `$${s.ev.toFixed(2)}`,
    colorKey: s.colorKey,
  }));

  // ── Top hits sorted by EV contribution ───────────────────────────────────
  type HitInput = { card: ScryfallCard; evContrib: number; pullsPer36: number; isSerialized?: boolean };
  const hitPool: HitInput[] = [
    ...mythics.map(c => ({
      card: c,
      evContrib: mythicEVContrib(c),
      pullsPer36: mythics.length > 0 ? PACKS * MYTHIC_RATE / mythics.length : 0,
    })),
    ...rares.map(c => ({
      card: c,
      evContrib: rareEVContrib(c),
      pullsPer36: rares.length > 0 ? PACKS * RARE_RATE / rares.length : 0,
    })),
    ...treatments.map(c => ({
      card: c,
      evContrib: treatmentEVContrib(c),
      pullsPer36: treatments.length > 0 ? TREATMENT_PER_BOX / treatments.length : 0,
    })),
    ...specialGuests.map(c => ({
      card: c,
      evContrib: specialGuestEVContrib(c),
      pullsPer36: specialGuests.length > 0 ? SPECIAL_GUEST_PER_BOX / specialGuests.length : 0,
    })),
    // Serialized cards are always included regardless of EV — they are the headline chase hit
    ...serializedCards.map(c => ({
      card: c,
      evContrib: serializedEVContrib(c),
      pullsPer36: serializedCards.length > 0 ? SERIALIZED_PER_BOX / serializedCards.length : 0,
      isSerialized: true,
    })),
  ]
    .filter(h => h.isSerialized || usd(h.card.prices.usd) > 0.50)
    .sort((a, b) => {
      // Serialized cards always sort to the top regardless of EV contribution
      if (a.isSerialized && !b.isSerialized) return -1;
      if (!a.isSerialized && b.isSerialized) return 1;
      return b.evContrib - a.evContrib;
    })
    .slice(0, 15);

  const topHits = hitPool.map(({ card, evContrib, pullsPer36, isSerialized }) => {
    const price = usd(card.prices.usd);
    const pullRatePerPack = pullsPer36 / PACKS;
    const pullRateOneIn = pullRatePerPack > 0 ? Math.round(1 / pullRatePerPack) : 0;
    const pullPct = pullRatePerPack > 0 ? (pullRatePerPack * 100).toFixed(2) : '0.00';
    const rarity = card.rarity === 'mythic' ? 'M' : card.rarity === 'rare' ? 'R' : card.rarity === 'uncommon' ? 'U' : 'C';
    return {
      name: card.name,
      rarity: isSerialized ? 'S' : rarity,
      price: `$${price.toFixed(2)}`,
      pullRate: String(pullRateOneIn),
      pullPct: `${pullPct}%`,
      evContribution: `$${evContrib.toFixed(2)}`,
      artColors: artColors(card.name),
      artInitial: card.name[0].toUpperCase(),
      imageUri: cardArt(card),
    };
  });

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
  res.status(200).json({
    expectedValue: parseFloat(totalEV.toFixed(2)),
    evSegments,
    topHits,
    cardCounts: {
      mythics: mythics.length,
      rares: rares.length,
      treatments: treatments.length,
      specialGuests: specialGuests.length,
      serialized: serializedCards.length,
    },
    lastUpdated: new Date().toISOString().split('T')[0],
  });
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}
