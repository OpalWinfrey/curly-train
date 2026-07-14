export default async function handler(req: any, res: any) {
  const token = process.env.MANAPOOL_TOKEN ?? '';
  const email = process.env.MANAPOOL_EMAIL ?? '';

  let upstream: Response;
  try {
    upstream = await fetch('https://manapool.com/api/v1/prices/sealed', {
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
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.status(200).json(data);
}
