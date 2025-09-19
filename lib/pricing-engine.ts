// Advanced pricing engine converted from HTML pricing logic
// Handles glazing calculations, product pricing, and complete cost breakdowns

export interface ParsedProduct {
  fullName: string
  series: number | null
  style: string | null
  type: string | null
  swing: string | null
}

export interface Dimensions {
  width: number | null
  height: number | null
  widthMM: number | null
  heightMM: number | null
  widthInches: number | null
  heightInches: number | null
  squareFeet: number | null
  squareInches: number | null
}

export interface GlazingData {
  paneCount: number | null
  paneType: string
  lowEType: string
  lowECount: number
  fullGlazingSpec: string
  constructedText: string
  pricePerSqFt: number | null
  totalCost: string | null
}

export interface ProductPricing {
  found: boolean
  matchType?: string
  pricePerSqFt?: number
  squareFeet?: number
  productPrice?: string
  productName?: string
  parsed?: ParsedProduct
  error?: string
  effectiveSquareFeet?: number
  note?: string
}

export interface PricingData {
  dimensions: Dimensions
  glazing: GlazingData
  productName: ParsedProduct
  productPricing?: ProductPricing
  totalEstimate?: string | null
}

// Glazing price lookup table (price per square foot)
const GLAZING_PRICES: Record<string, number> = {
  'Dual Standard Low E': 15.97,
  'Dual Double Low E': 20.03,
  'Dual Triple Low E': 24.08,
  'Triple Standard Low E': 18.97,
  'Triple Double Low E': 20.02,
  'Triple Triple Low E': 24.08,
  'Triple XO E': 26.18
}

// Product pricing configuration (price per square foot)
const PRODUCT_PRICING: Record<string, Record<string, number>> = {
  '85-Contemporary': {
    'Fixed': 32.24,
    'Outward (Outswing Casement / Awning)': 67.39,
    'Inswing Casement': 67.39,
    'Tilt & Turn': 74.63,
    'Single Hinge Door': 104.20,
    'French Door': 139.13
  },
  '76-Classic': {
    'Fixed': 23.57,
    'Outward (Outswing Casement / Awning)': 49.74,
    'Inswing Casement': 49.74,
    'Tilt & Turn': 55.53,
    'Single Hinge Door': 70.64,
    'French Door': 73.94
  },
  '108-Contemporary': {
    'Tilt & Slide w/screen': 39.53
  },
  '118-Contemporary': {
    'Sliding Window w/screen': 39.53
  },
  '152-Classic': {
    'Lift & Slide': 74.98
  },
  // '182-Classic': {
  //   'Lift & Slide Hardware': 2554.00
  // },
  '236-Classic': {
    'Classic Lift & Slide (3 Tracks)': 89.98,
    'Classic Lift & Slide (3 Tracks) Hardware': 2254.00
  },
  '120-Contemporary': {
    'Traditional Sliding Door (2 Tracks)': 37.71,
    'Traditional Sliding Door (2 Tracks) Hardware': 1836.97,
    'Lift & Slide (2 Tracks)': 41.90,
    'Lift & Slide (2 Tracks) Hardware': 2254.00
  },
  '185-Contemporary': {
    'Traditional Sliding Door (3 Tracks)': 41.83,
    'Traditional Sliding Door (3 Tracks) Hardware': 1836.97,
    'Lift & Slide (3 Tracks)': 48.70,
    'Lift & Slide (3 Tracks) Hardware': 2043.30
  },
  '251-Contemporary': {
    'Traditional Sliding Door (4 Tracks)': 52.60,
    'Traditional Sliding Door (4 Tracks) Hardware': 2043.30
  }
}

// Special pricing rules
const SPECIAL_PRICING = {
  Screen: {
    applicableSeries: [79, 85],
    types: {
      Fiberglass: {
        pricePerSqFt: 9.47,
        minimumSqFt: 10.76,
        note: 'If size less than 10.76 SQFT, equal to 10.76 SQFT'
      }
    }
  }
}

export function parseProductName(fullName: string): ParsedProduct {
  const parsed: ParsedProduct = {
    fullName: fullName,
    series: null,
    style: null,
    type: null,
    swing: null
  }

  // Split by hyphen to separate main part and swing
  const parts = fullName.split(' - ')
  const mainPart = parts[0].trim()
  const swingPart = parts.length > 1 ? parts[1].trim() : null

  // Split main part into tokens
  const tokens = mainPart.split(/\s+/)
  let currentIndex = 0

  // Extract series (first number token)
  if (currentIndex < tokens.length) {
    const firstToken = tokens[currentIndex]
    const seriesMatch = firstToken.match(/^\d+/)
    if (seriesMatch) {
      parsed.series = parseInt(seriesMatch[0])
      currentIndex++
    }
  }

  // Extract style (Classic or Contemporary)
  if (currentIndex < tokens.length) {
    const styleToken = tokens[currentIndex].toLowerCase()
    if (styleToken === 'classic' || styleToken === 'contemporary') {
      parsed.style = tokens[currentIndex] // Keep original case
      currentIndex++
    }
  }

  // Extract type (remaining words)
  if (currentIndex < tokens.length) {
    const typeTokens = tokens.slice(currentIndex)
    const rawType = typeTokens.join(' ')
    parsed.type = normalizeType(rawType)
  }

  // Extract swing (after hyphen)
  if (swingPart) {
    const swingLower = swingPart.toLowerCase()
    if (swingLower.includes('inswing')) {
      parsed.swing = 'Inswing'
    } else if (swingLower.includes('outswing')) {
      parsed.swing = 'Outswing'
    } else {
      parsed.swing = swingPart // Keep original if not standard
    }
  }

  // Check if swing should be null for certain types
  if (parsed.type && shouldIgnoreSwing(parsed.type)) {
    parsed.swing = null
  }

  return parsed
}

function normalizeType(rawType: string): string {
  const type = rawType.toLowerCase().trim()

  // Canonical type mappings
  const typeMap: Record<string, string> = {
    'fixed': 'Fixed',
    'tilt & turn': 'Tilt & Turn',
    'tilt and turn': 'Tilt & Turn',
    'casement - inswing': 'Inswing Casement',
    'inswing casement': 'Inswing Casement',
    'casement inswing': 'Inswing Casement',
    'awning': 'Outward (Outswing Casement / Awning)',
    'outswing casement': 'Outward (Outswing Casement / Awning)',
    'outward': 'Outward (Outswing Casement / Awning)',
    'single hinge door': 'Single Hinge Door',
    'french door': 'French Door',
    'sliding door': 'Sliding Door',
    'sliding window': 'Sliding Window',
    'tilt & slide window': 'Sliding Window',
    'bifold door': 'Bifold Door',
    'bi-fold': 'Bifold Door',
    'standard bi-fold': 'Bifold Door'
  }

  // Check for exact matches first
  if (typeMap[type]) {
    return typeMap[type]
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(typeMap)) {
    if (type.includes(key) || key.includes(type)) {
      return value
    }
  }

  // If no match found, return capitalized version
  return rawType.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

function shouldIgnoreSwing(type: string): boolean {
  const noSwingTypes = [
    'Fixed',
    'Tilt & Turn', 
    'Sliding Door',
    'Sliding Window',
    'Bifold Door'
  ]
  return noSwingTypes.includes(type)
}

export function findProductPrice(productName: string, dimensions?: Dimensions): ProductPricing {
  console.log('🔍 Finding price for product:', productName)
  
  // Parse the product name using existing logic
  const parsed = parseProductName(productName)
  console.log('📋 Parsed product:', parsed)
  
  // Create series-style lookup key
  const seriesStyleKey = `${parsed.series}-${parsed.style}`
  
  // Try direct lookup first
  const directPrice = directProductLookup(seriesStyleKey, parsed.type)
  if (directPrice !== null) {
    return calculateFinalProductPrice(directPrice, dimensions, parsed, 'Direct Match')
  }
  
  // Try fuzzy matching
  const fuzzyPrice = fuzzyProductLookup(seriesStyleKey, parsed.type)
  if (fuzzyPrice) {
    return calculateFinalProductPrice(fuzzyPrice.price, dimensions, parsed, fuzzyPrice.matchType)
  }
  
  // Check special pricing (screens, etc.)
  const specialPrice = checkSpecialPricing(parsed, dimensions)
  if (specialPrice) {
    return specialPrice
  }
  
  // No match found
  console.log('❌ No pricing found for:', productName)
  return {
    found: false,
    error: 'No pricing data available',
    productName: productName,
    parsed: parsed
  }
}

function directProductLookup(seriesStyleKey: string, productType: string | null): number | null {
  if (!productType) return null
  
  const seriesPricing = PRODUCT_PRICING[seriesStyleKey]
  if (seriesPricing && seriesPricing[productType] !== undefined) {
    console.log('✅ Direct match found:', `${seriesStyleKey} -> ${productType} = $${seriesPricing[productType]}`)
    return seriesPricing[productType]
  }
  return null
}

function fuzzyProductLookup(seriesStyleKey: string, productType: string | null): { price: number; matchType: string } | null {
  if (!productType) return null
  
  const seriesPricing = PRODUCT_PRICING[seriesStyleKey]
  if (!seriesPricing) {
    console.log('❌ Series not found:', seriesStyleKey)
    return null
  }
  
  // Try partial matching on product types
  const availableTypes = Object.keys(seriesPricing)
  console.log('🔄 Trying fuzzy matching against:', availableTypes)
  
  // Look for partial matches
  for (const availableType of availableTypes) {
    // Check if product type contains or is contained in available type
    const normalizedProduct = productType.toLowerCase()
    const normalizedAvailable = availableType.toLowerCase()
    
    // Contains match
    if (normalizedProduct.includes(normalizedAvailable) || normalizedAvailable.includes(normalizedProduct)) {
      console.log('🎯 Fuzzy match found:', `${productType} ≈ ${availableType}`)
      return {
        price: seriesPricing[availableType],
        matchType: `Fuzzy Match (${availableType})`
      }
    }
    
    // Word-based matching for complex types
    const productWords = normalizedProduct.split(/\s+/)
    const availableWords = normalizedAvailable.split(/\s+/)
    const commonWords = productWords.filter(word => availableWords.includes(word))
    
    if (commonWords.length >= 2) { // At least 2 words in common
      console.log('🎯 Word-based fuzzy match:', `${productType} ≈ ${availableType} (common: ${commonWords.join(', ')})`)
      return {
        price: seriesPricing[availableType],
        matchType: `Word Match (${availableType})`
      }
    }
  }
  
  return null
}

function checkSpecialPricing(parsed: ParsedProduct, dimensions?: Dimensions): ProductPricing | null {
  // Check for screen pricing (series 79 & 85)
  if (parsed.series && SPECIAL_PRICING.Screen.applicableSeries.includes(parsed.series)) {
    if (parsed.type && parsed.type.toLowerCase().includes('fiberglass')) {
      const screenPricing = SPECIAL_PRICING.Screen.types.Fiberglass
      const squareFeet = dimensions?.squareFeet || 0
      const effectiveSqFt = Math.max(squareFeet, screenPricing.minimumSqFt)
      
      console.log('🎯 Special screen pricing applied:', {
        series: parsed.series,
        actualSqFt: squareFeet,
        minimumSqFt: screenPricing.minimumSqFt,
        effectiveSqFt: effectiveSqFt,
        pricePerSqFt: screenPricing.pricePerSqFt
      })
      
      return {
        found: true,
        matchType: 'Special Screen Pricing',
        pricePerSqFt: screenPricing.pricePerSqFt,
        effectiveSquareFeet: effectiveSqFt,
        productPrice: (screenPricing.pricePerSqFt * effectiveSqFt).toFixed(2),
        note: screenPricing.note,
        productName: parsed.fullName,
        parsed: parsed
      }
    }
  }
  return null
}

function calculateFinalProductPrice(pricePerSqFt: number, dimensions: Dimensions | undefined, parsed: ParsedProduct, matchType: string): ProductPricing {
  if (!dimensions || !dimensions.squareFeet) {
    console.log('⚠️ No dimensions available for price calculation')
    return {
      found: true,
      matchType: matchType,
      pricePerSqFt: pricePerSqFt,
      productPrice: undefined,
      error: 'Dimensions required for final price calculation',
      productName: parsed.fullName,
      parsed: parsed
    }
  }
  
  const squareFeet = dimensions.squareFeet
  const productPrice = (pricePerSqFt * squareFeet).toFixed(2)
  
  console.log('💰 Final product price calculated:', {
    matchType: matchType,
    pricePerSqFt: `$${pricePerSqFt}`,
    squareFeet: squareFeet.toFixed(2),
    productPrice: `$${productPrice}`
  })
  
  return {
    found: true,
    matchType: matchType,
    pricePerSqFt: pricePerSqFt,
    squareFeet: squareFeet,
    productPrice: productPrice,
    productName: parsed.fullName,
    parsed: parsed
  }
}

export function constructGlazingText(paneCount: number, lowECount: number): string {
  let paneText = ''
  let lowEText = ''
  
  // Map pane count to text
  switch(paneCount) {
    case 2: paneText = 'Dual'; break
    case 3: paneText = 'Triple'; break
    default: paneText = 'Unknown'
  }
  
  // Map Low-E count to text
  switch(lowECount) {
    case 1: lowEText = 'Standard'; break
    case 2: lowEText = 'Double'; break
    case 3: lowEText = 'Triple'; break
    default: lowEText = 'Unknown'
  }
  
  if (paneText === 'Unknown' || lowEText === 'Unknown') {
    return 'Unknown Glazing Configuration'
  }
  
  return `${paneText} ${lowEText} Low E`
}

export function calculateGlazingCost(glazingText: string, squareFeet: number): { pricePerSqFt: number | null; totalCost: string | null; error: string | null } {
  const pricePerSqFt = GLAZING_PRICES[glazingText]
  if (!pricePerSqFt || !squareFeet) {
    return {
      pricePerSqFt: null,
      totalCost: null,
      error: 'Missing price data or dimensions'
    }
  }
  
  return {
    pricePerSqFt: pricePerSqFt,
    totalCost: (pricePerSqFt * squareFeet).toFixed(2),
    error: null
  }
}

export function extractPricingDetails(bay: any): PricingData {
  const pricingData: PricingData = {
    dimensions: {
      width: null,
      height: null,
      widthMM: null,
      heightMM: null,
      widthInches: null,
      heightInches: null,
      squareFeet: null,
      squareInches: null
    },
    glazing: {
      paneCount: null,
      paneType: 'Unknown',
      lowEType: 'Unknown',
      lowECount: 0,
      fullGlazingSpec: 'Unknown',
      constructedText: 'Unknown',
      pricePerSqFt: null,
      totalCost: null
    },
    productName: {
      fullName: 'Unknown',
      series: null,
      style: null,
      type: null,
      swing: null
    }
  }

  // Parse product name
  const productName = bay.infoProperties?.[0]?.value || 'Unknown'
  pricingData.productName = parseProductName(productName)

  // Extract dimensions from frame collections
  if (bay.frameCollections && Array.isArray(bay.frameCollections)) {
    bay.frameCollections.forEach((collection: any) => {
      if (collection.width) {
        pricingData.dimensions.width = collection.width
        pricingData.dimensions.widthMM = collection.width // Already in MM
      }
      if (collection.height) {
        pricingData.dimensions.height = collection.height
        pricingData.dimensions.heightMM = collection.height // Already in MM
      }

      // Convert to inches and calculate square footage
      if (pricingData.dimensions.widthMM && pricingData.dimensions.heightMM) {
        const mmToInches = 0.0393701 // 1 mm = 0.0393701 inches
        
        pricingData.dimensions.widthInches = pricingData.dimensions.widthMM * mmToInches
        pricingData.dimensions.heightInches = pricingData.dimensions.heightMM * mmToInches
        
        // Calculate area
        pricingData.dimensions.squareInches = pricingData.dimensions.widthInches * pricingData.dimensions.heightInches
        pricingData.dimensions.squareFeet = pricingData.dimensions.squareInches / 144 // 144 square inches = 1 square foot
      }

      // Extract glazing details from frames
      if (collection.frames && Array.isArray(collection.frames)) {
        collection.frames.forEach((frame: any) => {
          // Process apertures for glazing
          if (frame.apertures && Array.isArray(frame.apertures)) {
            frame.apertures.forEach((aperture: any) => {
              // Process sash frames for glazing specs
              if (aperture.sashFrames && Array.isArray(aperture.sashFrames)) {
                aperture.sashFrames.forEach((sash: any) => {
                  if (sash.apertures && sash.apertures[0]) {
                    const glazingProduct = sash.apertures[0].product
                    
                    pricingData.glazing.fullGlazingSpec = glazingProduct
                    
                    // Parse pane information from product string
                    if (glazingProduct) {
                      // Extract pane count (Double-Pane, Triple-Pane, etc.)
                      if (glazingProduct.toLowerCase().includes('double-pane')) {
                        pricingData.glazing.paneCount = 2
                        pricingData.glazing.paneType = 'Double-Pane'
                      } else if (glazingProduct.toLowerCase().includes('triple-pane')) {
                        pricingData.glazing.paneCount = 3
                        pricingData.glazing.paneType = 'Triple-Pane'
                      } else if (glazingProduct.toLowerCase().includes('single-pane')) {
                        pricingData.glazing.paneCount = 1
                        pricingData.glazing.paneType = 'Single-Pane'
                      }
                      
                      // Extract Low-E information
                      const lowEMatches = glazingProduct.match(/(\d+)-?Low-?E/gi)
                      if (lowEMatches) {
                        const lowEMatch = lowEMatches[0]
                        const lowENumber = lowEMatch.match(/(\d+)/)
                        if (lowENumber) {
                          pricingData.glazing.lowECount = parseInt(lowENumber[1])
                          pricingData.glazing.lowEType = lowEMatch
                        }
                      } else if (glazingProduct.toLowerCase().includes('low-e')) {
                        pricingData.glazing.lowECount = 1
                        pricingData.glazing.lowEType = 'Low-E'
                      }
                    }
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  // Construct glazing text after all glazing data is extracted
  if (pricingData.glazing.paneCount && pricingData.glazing.lowECount > 0) {
    pricingData.glazing.constructedText = constructGlazingText(
      pricingData.glazing.paneCount, 
      pricingData.glazing.lowECount
    )
    
    // Calculate glazing cost
    if (pricingData.dimensions.squareFeet) {
      const costCalculation = calculateGlazingCost(
        pricingData.glazing.constructedText,
        pricingData.dimensions.squareFeet
      )
      
      pricingData.glazing.pricePerSqFt = costCalculation.pricePerSqFt
      pricingData.glazing.totalCost = costCalculation.totalCost
      
      console.log('🏷️ Glazing Text Constructed:', {
        'Pane Count': pricingData.glazing.paneCount,
        'Low-E Count': pricingData.glazing.lowECount, 
        'Constructed Text': pricingData.glazing.constructedText
      })
      
      if (costCalculation.error) {
        console.log('❌ Glazing Cost Calculation Error:', costCalculation.error)
      } else {
        console.log('💲 Glazing Cost Calculation:', {
          'Square Feet': pricingData.dimensions.squareFeet?.toFixed(2),
          'Price per Sq Ft': `$${costCalculation.pricePerSqFt}`,
          'Total Glazing Cost': `$${costCalculation.totalCost}`
        })
      }
    }
  }

  // Log essential pricing data
  console.log('💰 Pricing Data Summary for:', pricingData.productName.fullName)
  console.log('   📐 Dimensions:', `${pricingData.dimensions.widthMM} x ${pricingData.dimensions.heightMM} mm (${pricingData.dimensions.squareFeet?.toFixed(2)} sq ft)`)
  console.log('   🪟 Glazing:', pricingData.glazing.constructedText || 'Unknown')
  if (pricingData.glazing.totalCost) {
    console.log('   💲 Glazing Cost:', `$${pricingData.glazing.totalCost} (${pricingData.dimensions.squareFeet?.toFixed(2)} sq ft × $${pricingData.glazing.pricePerSqFt}/sq ft)`)
  }

  return pricingData
}

export function extractCompletePricingDetails(bay: any): PricingData {
  // Get existing pricing data
  const pricingData = extractPricingDetails(bay)
  
  // Add product pricing
  const productPricing = findProductPrice(
    pricingData.productName.fullName, 
    pricingData.dimensions
  )
  
  // Combine all pricing information
  pricingData.productPricing = productPricing
  pricingData.totalEstimate = null
  
  // Calculate total estimate if both glazing and product pricing are available
  if (pricingData.glazing.totalCost && productPricing.found && productPricing.productPrice) {
    const glazingCost = parseFloat(pricingData.glazing.totalCost)
    const productCost = parseFloat(productPricing.productPrice)
    pricingData.totalEstimate = (glazingCost + productCost).toFixed(2)
    
    console.log('💰 Complete Pricing Summary:')
    console.log(`   🪟 Product Cost: $${productPricing.productPrice} (${productPricing.matchType})`)
    console.log(`   🔍 Glazing Cost: $${pricingData.glazing.totalCost}`)
    console.log(`   📊 Total Estimate: $${pricingData.totalEstimate}`)
  }
  
  return pricingData
}

export function recalculateItemPricing(item: any): any {
  console.log('🔄 Recalculating pricing for item:', item.designDetails?.frameType)
  
  // Create a mock bay object from the item data for pricing calculation
  const mockBay = {
    infoProperties: [{ value: item.designDetails?.frameType || 'Unknown' }],
    frameCollections: [{
      width: item.pricingBreakdown?.dimensions?.widthMM || null,
      height: item.pricingBreakdown?.dimensions?.heightMM || null,
      frames: [{
        apertures: [{
          sashFrames: [{
            apertures: [{
              product: item.glazing?.specs || 'Unknown'
            }]
          }]
        }]
      }]
    }],
    frameColours: [item.appearance?.externalFinish, item.appearance?.internalFinish].filter(Boolean),
    quantity: item.quantity || 1,
    price: item.unitPrice || 0
  }

  // Extract pricing details using the existing engine
  const pricingData = extractCompletePricingDetails(mockBay)
  
  // Update the item with new pricing
  const updatedItem = {
    ...item,
    unitPrice: pricingData.totalEstimate ? parseFloat(pricingData.totalEstimate) : item.unitPrice,
    totalPrice: (pricingData.totalEstimate ? parseFloat(pricingData.totalEstimate) : item.unitPrice) * (item.quantity || 1),
    pricingBreakdown: {
      ...item.pricingBreakdown,
      dimensions: pricingData.dimensions,
      productPricing: pricingData.productPricing,
      glazingCost: pricingData.glazing.totalCost,
      productCost: pricingData.productPricing?.productPrice,
      totalEstimate: pricingData.totalEstimate,
      matchType: pricingData.productPricing?.matchType,
    },
    glazing: {
      ...item.glazing,
      type: pricingData.glazing.constructedText || item.glazing?.type,
      specs: pricingData.glazing.fullGlazingSpec || item.glazing?.specs,
      paneCount: pricingData.glazing.paneCount || item.glazing?.paneCount,
      lowECount: pricingData.glazing.lowECount || item.glazing?.lowECount,
      pricePerSqFt: pricingData.glazing.pricePerSqFt || item.glazing?.pricePerSqFt,
      totalCost: pricingData.glazing.totalCost || item.glazing?.totalCost,
    }
  }

  console.log('✅ Item pricing recalculated:', {
    oldUnitPrice: item.unitPrice,
    newUnitPrice: updatedItem.unitPrice,
    oldTotalPrice: item.totalPrice,
    newTotalPrice: updatedItem.totalPrice
  })

  return updatedItem
}
