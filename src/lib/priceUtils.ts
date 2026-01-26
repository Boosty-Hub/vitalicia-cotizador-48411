/**
 * Utility functions for price formatting and validation
 */

/**
 * Formats a price value to have maximum 2 decimal places
 * @param value - The price value (string or number)
 * @returns Formatted price string with max 2 decimals
 */
export function formatPriceToTwoDecimals(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "0";
  }
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return "0";
  }
  
  // Round to 2 decimal places and convert to string
  return Number(numValue.toFixed(2)).toString();
}

/**
 * Parses a price from any format and returns a number with max 2 decimals
 * @param value - The price value to parse
 * @returns Number with max 2 decimal places
 */
export function parsePriceToNumber(value: any): number {
  if (!value) return 0;
  
  if (typeof value === "number") {
    return Math.round(value * 100) / 100;
  }
  
  // Remove $ and commas, then parse
  const cleaned = String(value).replace(/[$,]/g, "").trim();
  const num = parseFloat(cleaned);
  
  if (isNaN(num)) return 0;
  
  return Math.round(num * 100) / 100;
}
