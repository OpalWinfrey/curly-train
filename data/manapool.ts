export interface ManapoolSealedListing {
  product_id: string;
  product_type: string;
  language_id: string;
  set_code: string;
  name: string;
  tcgplayer_product_id: number;
  low_price: number | null;
  price_market: number | null;
  available_quantity: number;
  url: string;
}

interface ManapoolSealedResponse {
  meta: { as_of: string };
  data: ManapoolSealedListing[];
}

export async function fetchSealedPrices(): Promise<ManapoolSealedListing[]> {
  const res = await fetch('/api/manapool-prices');
  if (!res.ok) throw new Error(`Manapool API error: ${res.status}`);
  const data: ManapoolSealedResponse = await res.json();
  return (data.data ?? []).filter(l => l.language_id === 'EN');
}
