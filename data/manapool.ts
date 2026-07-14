export interface ManapoolSealedProduct {
  MTGJsonID: string;
  Name: string;
  Set: string;
  LanguageID: string;
}

export interface ManapoolSealedListing {
  MTGJsonID: string;
  PriceCents: number;
  Sealed: ManapoolSealedProduct;
}

interface ManapoolSealedResponse {
  Meta: { LastUpdated: string; Total: number };
  Listings: ManapoolSealedListing[];
}

export async function fetchSealedPrices(): Promise<ManapoolSealedListing[]> {
  const token = process.env.EXPO_PUBLIC_MANAPOOL_TOKEN ?? '';
  const email = process.env.EXPO_PUBLIC_MANAPOOL_EMAIL ?? '';
  const res = await fetch('https://manapool.com/api/v1/prices/sealed', {
    headers: {
      'X-ManaPool-Access-Token': token,
      'X-ManaPool-Email': email,
    },
  });
  if (!res.ok) throw new Error(`Manapool API error: ${res.status}`);
  const data: ManapoolSealedResponse = await res.json();
  return (data.Listings ?? []).filter(l => l.Sealed.LanguageID === 'en');
}
