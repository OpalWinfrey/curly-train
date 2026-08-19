interface Req { method?: string; query: Record<string, string | string[]> }
interface Res { status(c: number): Res; json(d: unknown): void; setHeader(k: string, v: string): void }

const MAX_IDS = 100;

export default async function handler(req: Req, res: Res) {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const raw = req.query.scryfall_ids;
  const scryfallIds = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(Boolean);
  if (scryfallIds.length === 0) {
    res.status(400).json({ error: 'scryfall_ids query param is required' });
    return;
  }
  if (scryfallIds.length > MAX_IDS) {
    res.status(400).json({ error: `scryfall_ids accepts at most ${MAX_IDS} ids` });
    return;
  }

  const token = process.env.MANAPOOL_TOKEN ?? '';
  const email = process.env.MANAPOOL_EMAIL ?? '';

  const upstreamUrl = new URL('https://manapool.com/api/v1/products/singles');
  for (const id of scryfallIds) upstreamUrl.searchParams.append('scryfall_ids', id);

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl.toString(), {
      headers: {
        'X-ManaPool-Access-Token': token,
        'X-ManaPool-Email': email,
      },
    });
  } catch {
    res.status(502).json({ error: 'Failed to reach Manapool API' });
    return;
  }

  if (!upstream.ok) {
    res.status(upstream.status).json({ error: `Manapool API error: ${upstream.status}` });
    return;
  }

  const data = await upstream.json();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.status(200).json(data);
}
