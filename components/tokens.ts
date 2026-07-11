export const Colors = {
  bg: '#090B10',
  surface: '#12151D',
  surface2: '#1A1F2E',
  surface3: '#0E1018',
  accent: '#8B5CF6',
  accent2: '#7C3AED',
  accentGlow: 'rgba(139,92,246,0.18)',
  success: '#10B981',
  successBg: 'rgba(16,185,129,0.12)',
  warning: '#F59E0B',
  warnBg: 'rgba(245,158,11,0.10)',
  danger: '#EF4444',
  dangerBg: 'rgba(239,68,68,0.10)',
  gold: '#D4A843',
  text1: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#475569',
  border: 'rgba(255,255,255,0.055)',
  border2: 'rgba(255,255,255,0.03)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const Typography = {
  displayLg: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1.5 },
  displayMd: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.8 },
  displaySm: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.5 },
  heading: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.4 },
  subheading: { fontSize: 15, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 11, fontWeight: '500' as const },
  label: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  numeric: { fontVariant: ['tabular-nums' as const] },
} as const;

// Donut / chart segment colors
export const ChartColors = {
  mythics: '#3B82F6',
  rares: '#F97316',
  foils: '#22C55E',
  showcase: '#8B5CF6',
  specialGuests: '#EC4899',
  bulk: '#475569',
} as const;
