// ============================================================================
// FORMATTING UTILITIES
// This file re-exports from the countries module for backwards compatibility
// and adds some convenience wrappers
// ============================================================================

import {
  formatCurrency as formatCurrencyBase,
  formatCurrencyWithCents as formatCurrencyWithCentsBase,
  formatNumber as formatNumberBase,
  type CurrencyCode,
} from "./countries/currency";

// Re-export everything from currency module
export {
  formatPercentage,
  parseFormattedNumber,
  type CurrencyCode,
} from "./countries/currency";

// Default currency for backwards compatibility
const DEFAULT_CURRENCY: CurrencyCode = "USD";

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currencyCode - Optional currency code (defaults to USD for backwards compatibility)
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY): string {
  return formatCurrencyBase(amount, currencyCode);
}

/**
 * Format a number as currency with cents
 * @param amount - The amount to format
 * @param currencyCode - Optional currency code (defaults to USD for backwards compatibility)
 */
export function formatCurrencyWithCents(amount: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY): string {
  return formatCurrencyWithCentsBase(amount, currencyCode);
}

/**
 * Format a number with locale-specific formatting
 * @param value - The value to format
 * @param currencyCode - Optional currency code for locale (defaults to USD)
 */
export function formatNumber(value: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY): string {
  return formatNumberBase(value, currencyCode);
}
