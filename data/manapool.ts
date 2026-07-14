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
  const res = await fetch('/api/manapool-prices');
  if (!res.ok) throw new Error(`Manapool API error: ${res.status}`);
  const data: ManapoolSealedResponse = await res.json();
  return (data.Listings ?? []).filter(l => l.Sealed.LanguageID === 'en');
}
