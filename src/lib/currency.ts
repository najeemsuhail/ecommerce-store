/**
 * Currency Configuration
 * Change these values to switch currencies globally
 */

export const CURRENCY_CONFIG = {
  symbol: '₹', // Currency symbol (₹ for INR, $ for USD, € for EUR, £ for GBP, etc.)
  code: 'INR', // Currency code (ISO 4217)
  name: 'Indian Rupee', // Currency name
  decimals: 2, // Number of decimal places
  locale: 'en-IN', // Locale for number formatting
};

/**
 * Format a price with currency symbol
 * @param price - Price amount
 * @param options - Optional formatting options
 * @returns Formatted price string (e.g., "₹1,234.56")
 */
export function formatPrice(
  price: number | string,
  options: {
    symbol?: string;
    decimals?: number;
    locale?: string;
  } = {}
): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return `${options.symbol || CURRENCY_CONFIG.symbol}0.00`;
  }

  const symbol = options.symbol || CURRENCY_CONFIG.symbol;
  const decimals = options.decimals ?? CURRENCY_CONFIG.decimals;
  const locale = options.locale || CURRENCY_CONFIG.locale;

  const formattedNumber = numPrice.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formattedNumber}`;
}

/**
 * Format a price range
 * @param min - Minimum price
 * @param max - Maximum price
 * @returns Formatted price range string (e.g., "₹100 - ₹5,000")
 */
export function formatPriceRange(min: number, max: number): string {
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(): string {
  return CURRENCY_CONFIG.symbol;
}

/**
 * Convert between currencies (placeholder for future use)
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount (currently just returns the same amount)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  // This is a placeholder for future currency conversion logic
  // You could integrate with an exchange rate API here
  if (fromCurrency === toCurrency) {
    return amount;
  }
  // For now, just return the same amount
  return amount;
}
