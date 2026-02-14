/**
 * Calculate shipping cost based on order total
 * 
 * Shipping Rules:
 * - Free shipping for orders ≥ ₹1000
 * - ₹50 flat rate for orders < ₹1000
 * - Free for digital-only orders
 */
export function calculateShippingCost(orderTotal: number, hasPhysicalProducts: boolean): number {
  // No shipping for digital-only orders
  if (!hasPhysicalProducts) return 0;
  
  // Free shipping for orders >= 1000
  if (orderTotal >= 1000) return 0;
  
  // Flat rate for orders < 1000
  return 50;
}
