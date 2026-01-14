/**
 * Variant Utilities
 * Helper functions for handling product variants, pricing, and stock
 */

export interface VariantAttribute {
  [key: string]: string
}

export interface ProductVariant {
  id: string
  attributes: VariantAttribute
  sku: string
  price?: number
  stock: number
  images?: string[]
  weight?: number
  dimensions?: string
}

export interface VariantGroup {
  name: string
  values: string[]
}

/**
 * Get the display price for a variant
 * @param variant - The selected variant (may be undefined)
 * @param basePrice - The base product price
 * @returns The price to display (variant price if set, otherwise base price)
 */
export function getVariantPrice(variant: ProductVariant | undefined, basePrice: number): number {
  // If variant has a price override, use it
  if (variant && variant.price !== undefined && variant.price !== null) {
    return variant.price
  }
  // Otherwise use base price
  return basePrice
}

/**
 * Check if a variant price differs from the base price
 * @param variant - The selected variant
 * @param basePrice - The base product price
 * @returns true if variant has a different price than base
 */
export function hasVariantPriceOverride(variant: ProductVariant | undefined, basePrice: number): boolean {
  if (!variant || variant.price === undefined || variant.price === null) {
    return false
  }
  return variant.price !== basePrice
}

/**
 * Get the stock available for a variant
 * @param variant - The selected variant (may be undefined)
 * @param totalStock - Total product stock
 * @returns The stock count
 */
export function getVariantStock(variant: ProductVariant | undefined, totalStock: number): number {
  if (variant) {
    return variant.stock
  }
  return totalStock
}

/**
 * Find a variant by its attribute combination
 * @param variants - Array of all variants
 * @param selectedAttributes - Current selected attributes
 * @returns The matching variant or undefined
 */
export function findVariantByCombination(
  variants: ProductVariant[],
  selectedAttributes: VariantAttribute
): ProductVariant | undefined {
  if (!variants || variants.length === 0) {
    return undefined
  }

  return variants.find((variant) => {
    return Object.keys(selectedAttributes).every(
      (key) => variant.attributes[key] === selectedAttributes[key]
    )
  })
}

/**
 * Check which variant option values are available for a given attribute
 * considering current selections of other attributes
 * @param variants - Array of all variants
 * @param attributeName - The attribute to check availability for
 * @param currentAttributes - Current selections for other attributes
 * @returns Array of available values for the given attribute
 */
export function getAvailableVariantOptions(
  variants: ProductVariant[],
  attributeName: string,
  currentAttributes: VariantAttribute
): string[] {
  if (!variants || variants.length === 0) {
    return []
  }

  const available = new Set<string>()

  variants.forEach((variant) => {
    // Check if this variant matches all other selected attributes
    const otherAttrs = Object.keys(currentAttributes).filter((k) => k !== attributeName)
    const matchesOthers = otherAttrs.every((k) => variant.attributes[k] === currentAttributes[k])

    if (matchesOthers) {
      // Add this variant's value for the attribute we're checking
      available.add(variant.attributes[attributeName])
    }
  })

  return Array.from(available).sort()
}

/**
 * Check if a specific variant option is available
 * @param variants - Array of all variants
 * @param attributeName - The attribute to check
 * @param optionValue - The value to check availability for
 * @param currentAttributes - Current selections for other attributes
 * @returns true if the option is available
 */
export function isVariantOptionAvailable(
  variants: ProductVariant[],
  attributeName: string,
  optionValue: string,
  currentAttributes: VariantAttribute
): boolean {
  if (!variants || variants.length === 0) {
    return true
  }

  return variants.some((variant) => {
    // Check if variant has this attribute value
    if (variant.attributes[attributeName] !== optionValue) {
      return false
    }

    // Check if all other attributes match current selection
    const otherAttrs = Object.keys(currentAttributes).filter((k) => k !== attributeName)
    return otherAttrs.every((k) => variant.attributes[k] === currentAttributes[k])
  })
}

/**
 * Format a variant description (e.g., "Red - Large")
 * @param variant - The variant to describe
 * @returns A human-readable string representation
 */
export function formatVariantDescription(variant: ProductVariant): string {
  return Object.values(variant.attributes).join(' - ')
}

/**
 * Get all unique values for a variant attribute across all variants
 * @param variants - Array of all variants
 * @param attributeName - The attribute name
 * @returns Array of unique values
 */
export function getUniqueVariantValues(variants: ProductVariant[], attributeName: string): string[] {
  if (!variants || variants.length === 0) {
    return []
  }

  const values = new Set<string>()
  variants.forEach((variant) => {
    if (variant.attributes[attributeName]) {
      values.add(variant.attributes[attributeName])
    }
  })

  return Array.from(values).sort()
}

/**
 * Check if a value looks like a color name
 * Useful for deciding whether to render as swatch or button
 * @param value - The value to check
 * @returns true if likely a color
 */
export function looksLikeColor(value: string): boolean {
  const colorNames = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black',
    'white', 'gray', 'grey', 'silver', 'gold', 'beige', 'navy', 'teal', 'cyan',
    'magenta', 'maroon', 'khaki', 'coral', 'salmon', 'indigo', 'violet',
  ]

  const lowerValue = value.toLowerCase().trim()
  return colorNames.includes(lowerValue)
}

/**
 * Convert a color name to a hex code (for display swatches)
 * @param colorName - The color name
 * @returns A hex color code or the original value
 */
export function colorNameToHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    red: '#EF4444',
    blue: '#3B82F6',
    green: '#22C55E',
    yellow: '#EAB308',
    orange: '#F97316',
    purple: '#A855F7',
    pink: '#EC4899',
    brown: '#92400E',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#6B7280',
    grey: '#6B7280',
    silver: '#C0C0C0',
    gold: '#FFD700',
    beige: '#F5F5DC',
    navy: '#000080',
    teal: '#008080',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    maroon: '#800000',
    khaki: '#F0E68C',
    coral: '#FF7F50',
    salmon: '#FA8072',
    indigo: '#4B0082',
    violet: '#EE82EE',
  }

  const hex = colorMap[colorName.toLowerCase()]
  return hex || colorName
}

/**
 * Calculate total price including quantity
 * @param unitPrice - Price per unit
 * @param quantity - Number of units
 * @returns Total price
 */
export function calculateTotalPrice(unitPrice: number, quantity: number): number {
  return unitPrice * quantity
}

/**
 * Format price for display
 * @param price - The price number
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

/**
 * Get variant group from variants array
 * Reconstructs variantGroups from actual variants
 * @param variants - Array of variants
 * @returns Array of variant groups
 */
export function extractVariantGroups(variants: ProductVariant[]): VariantGroup[] {
  if (!variants || variants.length === 0) {
    return []
  }

  const groups: Record<string, Set<string>> = {}

  variants.forEach((variant) => {
    Object.entries(variant.attributes).forEach(([attrName, attrValue]) => {
      if (!groups[attrName]) {
        groups[attrName] = new Set()
      }
      groups[attrName].add(attrValue)
    })
  })

  return Object.entries(groups).map(([name, values]) => ({
    name,
    values: Array.from(values).sort(),
  }))
}
