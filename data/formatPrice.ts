const CURRENCY_CONFIG: Record<string, { rate: number; symbol: string }> = {
  USD: { rate: 1, symbol: '$' },
  EUR: { rate: 0.92, symbol: '€' },
  GBP: { rate: 0.79, symbol: '£' },
};

export function formatPrice(amount: number, currency: string): string {
  const { rate, symbol } = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.USD;
  return `${symbol}${(amount * rate).toFixed(2)}`;
}

export function currencySymbol(currency: string): string {
  return (CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.USD).symbol;
}
