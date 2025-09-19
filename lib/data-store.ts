// In-memory data store for the MVP
export interface Associate {
  id: string
  userId: string
  name: string
  email: string
  password: string
  commissionPercentage: number
  createdAt: Date
}

export interface Dealer {
  id: string
  userId: string
  name: string
  businessName: string
  contact: string
  email: string
  phone: string
  password: string
  associateId: string
  createdAt: Date
  passwordChanged: boolean
}

export interface Quotation {
  id: string
  dealerId: string
  associateId: string
  name: string
  customerName: string
  totals: {
    subtotal: number
    tax: number
    grandTotal: number
  }
  status: {
    stage: number
    notes: string
    changedAt: Date
    changedBy: string
  }
  statusHistory: Array<{
    stage: number
    notes: string
    changedAt: Date
    changedBy: string
  }>
  notes: string
  pdfUrl?: string
  createdAt: Date
  lineItems?: any[]
  gridDivisions?: Array<{
    id: string
    itemId: string
    itemName: string
    horizontalLines: number
    verticalLines: number
  }>
  screenSelections?: Array<{
    id: string
    itemId: string
    itemName: string
    series: number
    needsScreen: boolean
  }>
}

export interface ProductPricing {
  id: string
  category: string
  name: string
  basePrice: number
  variables: Record<string, any>
  updatedAt: Date
}

export interface User {
  email: string
  password: string
  role: "ADMIN" | "ASSOCIATE" | "DEALER"
  dealerId?: string
  associateId?: string
}

// In-memory storage
const associates: Associate[] = [
  {
    id: "associate-1",
    userId: "assoc001",
    name: "Mike Johnson",
    email: "mike@windowcad.com",
    password: "password123",
    commissionPercentage: 5.0,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "associate-2",
    userId: "assoc002",
    name: "Sarah Williams",
    email: "sarah@windowcad.com",
    password: "password123",
    commissionPercentage: 7.5,
    createdAt: new Date("2024-01-15"),
  },
]

const dealers: Dealer[] = [
  {
    id: "dealer-1",
    userId: "dealer001",
    name: "John Smith",
    businessName: "ABC Windows & Doors",
    contact: "John Smith",
    email: "john@abcwindows.com",
    phone: "+1-555-0101",
    password: "password123",
    associateId: "associate-1",
    createdAt: new Date("2024-01-15"),
    passwordChanged: true,
  },
  {
    id: "dealer-2",
    userId: "dealer002",
    name: "Sarah Johnson",
    businessName: "Premium Glass Solutions",
    contact: "Sarah Johnson",
    email: "sarah@premiumglass.com",
    phone: "+1-555-0102",
    password: "password123",
    associateId: "associate-1",
    createdAt: new Date("2024-02-01"),
    passwordChanged: false,
  },
  {
    id: "dealer-3",
    userId: "dealer003",
    name: "Robert Davis",
    businessName: "Elite Window Systems",
    contact: "Robert Davis",
    email: "robert@elitewindows.com",
    phone: "+1-555-0103",
    password: "password123",
    associateId: "associate-2",
    createdAt: new Date("2024-02-15"),
    passwordChanged: true,
  },
]

const quotations: Quotation[] = [
  {
    id: "quote-1",
    dealerId: "dealer-1",
    associateId: "associate-1",
    name: "Residential Window Project",
    customerName: "John & Jane Smith",
    totals: {
      subtotal: 2500.0,
      tax: 250.0,
      grandTotal: 2750.0,
    },
    status: {
      stage: 3,
      notes: "Quote approved by customer, awaiting production",
      changedAt: new Date("2024-03-02"),
      changedBy: "associate-1",
    },
    statusHistory: [
      {
        stage: 1,
        notes: "Initial quote created",
        changedAt: new Date("2024-03-01"),
        changedBy: "dealer-1",
      },
      {
        stage: 2,
        notes: "Quote sent to customer",
        changedAt: new Date("2024-03-01"),
        changedBy: "associate-1",
      },
      {
        stage: 3,
        notes: "Quote approved by customer, awaiting production",
        changedAt: new Date("2024-03-02"),
        changedBy: "associate-1",
      },
    ],
    notes: "Customer prefers white frames, standard glass",
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "quote-2",
    dealerId: "dealer-1",
    associateId: "associate-1",
    name: "Commercial Door Installation",
    customerName: "ABC Corporation",
    totals: {
      subtotal: 5000.0,
      tax: 500.0,
      grandTotal: 5500.0,
    },
    status: {
      stage: 1,
      notes: "Initial quote created",
      changedAt: new Date("2024-03-05"),
      changedBy: "dealer-1",
    },
    statusHistory: [
      {
        stage: 1,
        notes: "Initial quote created",
        changedAt: new Date("2024-03-05"),
        changedBy: "dealer-1",
      },
    ],
    notes: "Large commercial project, requires special permits",
    createdAt: new Date("2024-03-05"),
  },
  {
    id: "quote-3",
    dealerId: "dealer-3",
    associateId: "associate-2",
    name: "Luxury Home Windows",
    customerName: "Michael & Sarah Johnson",
    totals: {
      subtotal: 8000.0,
      tax: 800.0,
      grandTotal: 8800.0,
    },
    status: {
      stage: 5,
      notes: "Production completed, ready for installation",
      changedAt: new Date("2024-03-10"),
      changedBy: "associate-2",
    },
    statusHistory: [
      {
        stage: 1,
        notes: "Initial quote created",
        changedAt: new Date("2024-03-08"),
        changedBy: "dealer-3",
      },
      {
        stage: 2,
        notes: "Quote sent to customer",
        changedAt: new Date("2024-03-08"),
        changedBy: "associate-2",
      },
      {
        stage: 3,
        notes: "Quote approved, production started",
        changedAt: new Date("2024-03-09"),
        changedBy: "associate-2",
      },
      {
        stage: 4,
        notes: "Production in progress",
        changedAt: new Date("2024-03-09"),
        changedBy: "associate-2",
      },
      {
        stage: 5,
        notes: "Production completed, ready for installation",
        changedAt: new Date("2024-03-10"),
        changedBy: "associate-2",
      },
    ],
    notes: "High-end project with custom glass specifications",
    createdAt: new Date("2024-03-08"),
  },
]

const productPricing: ProductPricing[] = [
  {
    id: "pricing-1",
    category: "Windows",
    name: "Standard Single Hung Window",
    basePrice: 250.0,
    variables: {
      sizeMultiplier: 1.0,
      glassType: "single",
      frameColor: "white",
      hardware: "standard",
    },
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "pricing-2",
    category: "Windows",
    name: "Double Hung Window",
    basePrice: 350.0,
    variables: {
      sizeMultiplier: 1.2,
      glassType: "double",
      frameColor: "white",
      hardware: "premium",
    },
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "pricing-3",
    category: "Doors",
    name: "Standard Entry Door",
    basePrice: 450.0,
    variables: {
      sizeMultiplier: 1.0,
      material: "steel",
      finish: "standard",
      hardware: "basic",
    },
    updatedAt: new Date("2024-01-01"),
  },
]

// Hardcoded users for authentication
const users: User[] = [
  {
    email: "admin@windowcad.com",
    password: "admin123",
    role: "ADMIN",
  },
  {
    email: "mike@windowcad.com",
    password: "password123",
    role: "ASSOCIATE",
    associateId: "associate-1",
  },
  {
    email: "sarah@windowcad.com",
    password: "password123",
    role: "ASSOCIATE",
    associateId: "associate-2",
  },
  {
    email: "john@abcwindows.com",
    password: "password123",
    role: "DEALER",
    dealerId: "dealer-1",
  },
  {
    email: "sarah@premiumglass.com",
    password: "password123",
    role: "DEALER",
    dealerId: "dealer-2",
  },
  {
    email: "robert@elitewindows.com",
    password: "password123",
    role: "DEALER",
    dealerId: "dealer-3",
  },
]

// Data access functions

// Authentication
export function authenticateUser(email: string, password: string): User | null {
  const user = users.find((u) => u.email === email && u.password === password)
  console.log("🔐 Authentication attempt:", { email, success: !!user, role: user?.role })
  return user || null
}

// Associate functions
export function getAllAssociates(): Associate[] {
  console.log("📋 Fetching all associates:", associates.length)
  return [...associates]
}

export function getAssociateById(id: string): Associate | null {
  const associate = associates.find((a) => a.id === id)
  console.log("🔍 Fetching associate by ID:", { id, found: !!associate })
  return associate || null
}

export function createAssociate(associateData: Omit<Associate, "id" | "createdAt">): Associate {
  const newAssociate: Associate = {
    ...associateData,
    id: `associate-${Date.now()}`,
    createdAt: new Date(),
  }

  associates.push(newAssociate)

  // Also create user account for the associate
  users.push({
    email: associateData.email,
    password: associateData.password,
    role: "ASSOCIATE",
    associateId: newAssociate.id,
  })

  console.log("✅ Created new associate:", newAssociate)
  return newAssociate
}

// Dealer functions
export function getAllDealers(): Dealer[] {
  console.log("📋 Fetching all dealers:", dealers.length)
  return [...dealers]
}

export function getDealerById(id: string): Dealer | null {
  const dealer = dealers.find((d) => d.id === id)
  console.log("🔍 Fetching dealer by ID:", { id, found: !!dealer })
  return dealer || null
}

export function getDealersByAssociateId(associateId: string): Dealer[] {
  const associateDealers = dealers.filter((d) => d.associateId === associateId)
  console.log("📋 Fetching dealers for associate:", { associateId, count: associateDealers.length })
  return associateDealers
}

export function createDealer(dealerData: Omit<Dealer, "id" | "createdAt" | "passwordChanged">): Dealer {
  const newDealer: Dealer = {
    ...dealerData,
    id: `dealer-${Date.now()}`,
    createdAt: new Date(),
    passwordChanged: false,
  }

  dealers.push(newDealer)

  // Also create user account for the dealer
  users.push({
    email: dealerData.email,
    password: dealerData.password,
    role: "DEALER",
    dealerId: newDealer.id,
  })

  console.log("✅ Created new dealer:", newDealer)
  return newDealer
}

// Quotation functions
export function getAllQuotations(): Quotation[] {
  console.log("📋 Fetching all quotations:", quotations.length)
  return [...quotations]
}

export function getQuotationById(id: string): Quotation | null {
  const quotation = quotations.find((q) => q.id === id)
  console.log("🔍 Fetching quotation by ID:", { id, found: !!quotation })
  return quotation || null
}

export function getQuotationsByDealerId(dealerId: string): Quotation[] {
  const dealerQuotations = quotations.filter((q) => q.dealerId === dealerId)
  console.log("📋 Fetching quotations for dealer:", { dealerId, count: dealerQuotations.length })
  return dealerQuotations
}

export function getQuotationsByAssociateId(associateId: string): Quotation[] {
  const associateQuotations = quotations.filter((q) => q.associateId === associateId)
  console.log("📋 Fetching quotations for associate:", { associateId, count: associateQuotations.length })
  return associateQuotations
}

export function createQuotation(quotationData: Omit<Quotation, "id" | "createdAt" | "status" | "statusHistory" | "notes">): Quotation {
  const newQuotation: Quotation = {
    ...quotationData,
    id: `quote-${Date.now()}`,
    status: {
      stage: 1,
      notes: "Initial quote created",
      changedAt: new Date(),
      changedBy: quotationData.dealerId,
    },
    statusHistory: [
      {
        stage: 1,
        notes: "Initial quote created",
        changedAt: new Date(),
        changedBy: quotationData.dealerId,
      },
    ],
    notes: "",
    createdAt: new Date(),
  }

  quotations.push(newQuotation)
  console.log("✅ Created new quotation:", newQuotation)
  return newQuotation
}

export function updateQuotationStatus(quotationId: string, stage: number, notes: string, changedBy: string): Quotation | null {
  const quotation = quotations.find((q) => q.id === quotationId)
  if (!quotation) {
    console.log("❌ Failed to update status:", { quotationId, found: false })
    return null
  }

  // Update current status
  quotation.status = {
    stage,
    notes,
    changedAt: new Date(),
    changedBy,
  }

  // Add to history
  quotation.statusHistory.push({
    stage,
    notes,
    changedAt: new Date(),
    changedBy,
  })

  console.log("✅ Updated quotation status:", { quotationId, stage, notes })
  return quotation
}

export function updateQuotationNotes(quotationId: string, notes: string): Quotation | null {
  const quotation = quotations.find((q) => q.id === quotationId)
  if (!quotation) {
    console.log("❌ Failed to update notes:", { quotationId, found: false })
    return null
  }

  quotation.notes = notes
  console.log("✅ Updated quotation notes:", { quotationId, notes })
  return quotation
}

export function updateQuotationItem(quotationId: string, itemIndex: number, updatedItem: any): Quotation | null {
  const quotation = quotations.find((q) => q.id === quotationId)
  if (!quotation || !quotation.lineItems || itemIndex < 0 || itemIndex >= quotation.lineItems.length) {
    console.log("❌ Failed to update item:", { quotationId, itemIndex, found: !!quotation })
    return null
  }

  // Update the specific item
  quotation.lineItems[itemIndex] = updatedItem

  // Recalculate totals
  const newTotals = calculateQuotationTotals(quotation.lineItems)
  quotation.totals = newTotals

  console.log("✅ Updated quotation item:", { quotationId, itemIndex, newTotals })
  return quotation
}

export function deleteQuotationItem(quotationId: string, itemIndex: number): Quotation | null {
  const quotation = quotations.find((q) => q.id === quotationId)
  if (!quotation || !quotation.lineItems || itemIndex < 0 || itemIndex >= quotation.lineItems.length) {
    console.log("❌ Failed to delete item:", { quotationId, itemIndex, found: !!quotation })
    return null
  }

  // Remove the item
  quotation.lineItems.splice(itemIndex, 1)

  // Update item numbers for remaining items
  quotation.lineItems.forEach((item, index) => {
    item.itemNumber = index + 1
  })

  // Recalculate totals
  const newTotals = calculateQuotationTotals(quotation.lineItems)
  quotation.totals = newTotals

  console.log("✅ Deleted quotation item:", { quotationId, itemIndex, newTotals })
  return quotation
}

// Product pricing functions
export function getAllProductPricing(): ProductPricing[] {
  console.log("📋 Fetching all product pricing:", productPricing.length)
  return [...productPricing]
}

export function getProductPricingById(id: string): ProductPricing | null {
  const pricing = productPricing.find((p) => p.id === id)
  console.log("🔍 Fetching product pricing by ID:", { id, found: !!pricing })
  return pricing || null
}

export function updateProductPricing(pricingData: ProductPricing): ProductPricing {
  const index = productPricing.findIndex((p) => p.id === pricingData.id)
  if (index === -1) {
    // Create new if doesn't exist
    productPricing.push(pricingData)
    console.log("✅ Created new product pricing:", pricingData)
  } else {
    // Update existing
    productPricing[index] = { ...pricingData, updatedAt: new Date() }
    console.log("✅ Updated product pricing:", pricingData)
  }
  return pricingData
}

// Helper functions
function calculateQuotationTotals(lineItems: any[]): { subtotal: number; tax: number; grandTotal: number } {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  const tax = subtotal * 0.1 // 10% tax rate
  const grandTotal = subtotal + tax

  return {
    subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
    tax: Math.round(tax * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100
  }
}
