import { useEffect, useState } from 'react';
import { ChartColors } from '../components/tokens';
import type { LiveEVData } from './types';

// Map the colorKey strings the API returns to actual color values from tokens
const COLOR_MAP: Record<string, string> = {
  mythics: ChartColors.mythics,
  rares: ChartColors.rares,
  foils: ChartColors.foils,
  showcase: ChartColors.showcase,
  specialGuests: ChartColors.specialGuests,
  bulk: ChartColors.bulk,
};

const cache = new Map<string, LiveEVData>();

export function useSetEV(setCode: string): { loading: boolean; evData: LiveEVData | null } {
  const key = setCode.toUpperCase();
  const [loading, setLoading] = useState(!cache.has(key));
  const [evData, setEvData] = useState<LiveEVData | null>(cache.get(key) ?? null);

  useEffect(() => {
    if (cache.has(key)) return;
    let active = true;
    setLoading(true);

    fetch(`/api/set-ev?setCode=${encodeURIComponent(key)}`)
      .then(r => (r.ok ? r.json() : null))
      .then((data: LiveEVData | null) => {
        if (!active || !data) return;
        // Apply real colors to segments
        const enriched: LiveEVData = {
          ...data,
          evSegments: data.evSegments.map(s => ({
            ...s,
            color: COLOR_MAP[s.colorKey] ?? ChartColors.bulk,
          })),
        };
        cache.set(key, enriched);
        setEvData(enriched);
      })
      .catch(() => {/* silently degrade to static data */})
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [key]);

  return { loading, evData };
}
