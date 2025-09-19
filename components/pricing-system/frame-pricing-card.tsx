"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Settings } from "lucide-react"

// Customer types for pricing
type CustomerType = 'dealer' | 'homeowner' | 'contractor' | 'tm'

// Bulk pricing tier
interface BulkPricingTier {
  minQuantity: number
  maxQuantity?: number
  discountPercentage: number
}

// Frame pricing data structure with sophisticated pricing
interface FramePricingEntry {
  id: string
  series: string
  style: string
  productType: string
  basePricePerSqFt: number
  customerPricing: {
    dealer: number
    homeowner: number
    contractor: number
    tm: number
  }
  bulkPricing: BulkPricingTier[]
  minimumOrder?: number
  specialRules?: string
  updatedAt: Date
}

// Initial data with sophisticated pricing structure
const initialFramePricing: FramePricingEntry[] = [
  // 85-Contemporary - Premium series with higher markups
  {
    id: "85-cont-fixed",
    series: "85",
    style: "Contemporary",
    productType: "Fixed",
    basePricePerSqFt: 32.24,
    customerPricing: {
      dealer: 32.24,      // Base price for dealers
      homeowner: 45.14,   // 40% markup for homeowners
      contractor: 35.46,  // 10% markup for contractors
      tm: 29.02           // 10% discount for trade management
    },
    bulkPricing: [
      { minQuantity: 10, maxQuantity: 24, discountPercentage: 5 },
      { minQuantity: 25, maxQuantity: 49, discountPercentage: 8 },
      { minQuantity: 50, discountPercentage: 12 }
    ],
    minimumOrder: 5,
    specialRules: "Premium series - requires minimum 5 sq ft order",
    updatedAt: new Date()
  },
  {
    id: "85-cont-outward",
    series: "85",
    style: "Contemporary",
    productType: "Outward (Outswing Casement / Awning)",
    basePricePerSqFt: 67.39,
    customerPricing: {
      dealer: 67.39,
      homeowner: 94.35,   // 40% markup
      contractor: 74.13,  // 10% markup
      tm: 60.65           // 10% discount
    },
    bulkPricing: [
      { minQuantity: 5, maxQuantity: 14, discountPercentage: 3 },
      { minQuantity: 15, maxQuantity: 29, discountPercentage: 6 },
      { minQuantity: 30, discountPercentage: 10 }
    ],
    minimumOrder: 3,
    specialRules: "Casement windows - complex hardware included",
    updatedAt: new Date()
  },
  {
    id: "85-cont-french",
    series: "85",
    style: "Contemporary",
    productType: "French Door",
    basePricePerSqFt: 139.13,
    customerPricing: {
      dealer: 139.13,
      homeowner: 194.78,  // 40% markup
      contractor: 153.04, // 10% markup
      tm: 125.22          // 10% discount
    },
    bulkPricing: [
      { minQuantity: 2, maxQuantity: 4, discountPercentage: 2 },
      { minQuantity: 5, maxQuantity: 9, discountPercentage: 5 },
      { minQuantity: 10, discountPercentage: 8 }
    ],
    minimumOrder: 1,
    specialRules: "French doors - premium hardware package included",
    updatedAt: new Date()
  },

  // 76-Classic - Standard series with moderate markups
  {
    id: "76-classic-fixed",
    series: "76",
    style: "Classic",
    productType: "Fixed",
    basePricePerSqFt: 23.57,
    customerPricing: {
      dealer: 23.57,
      homeowner: 32.00,   // 35% markup (lower than premium)
      contractor: 25.93,  // 10% markup
      tm: 21.21           // 10% discount
    },
    bulkPricing: [
      { minQuantity: 15, maxQuantity: 39, discountPercentage: 4 },
      { minQuantity: 40, maxQuantity: 79, discountPercentage: 7 },
      { minQuantity: 80, discountPercentage: 10 }
    ],
    minimumOrder: 10,
    specialRules: "Standard series - bulk orders preferred",
    updatedAt: new Date()
  },
  {
    id: "76-classic-casement",
    series: "76",
    style: "Classic",
    productType: "Outward (Outswing Casement / Awning)",
    basePricePerSqFt: 49.74,
    customerPricing: {
      dealer: 49.74,
      homeowner: 67.15,   // 35% markup
      contractor: 54.71,  // 10% markup
      tm: 44.77           // 10% discount
    },
    bulkPricing: [
      { minQuantity: 8, maxQuantity: 19, discountPercentage: 3 },
      { minQuantity: 20, maxQuantity: 39, discountPercentage: 6 },
      { minQuantity: 40, discountPercentage: 9 }
    ],
    minimumOrder: 5,
    specialRules: "Classic casement - standard hardware package",
    updatedAt: new Date()
  },

  // 108-Contemporary - Specialty series with screens included
  {
    id: "108-cont-tilt",
    series: "108",
    style: "Contemporary",
    productType: "Tilt & Slide w/screen",
    basePricePerSqFt: 39.53,
    customerPricing: {
      dealer: 39.53,
      homeowner: 55.34,   // 40% markup
      contractor: 43.48,  // 10% markup
      tm: 35.58           // 10% discount
    },
    bulkPricing: [
      { minQuantity: 3, maxQuantity: 7, discountPercentage: 2 },
      { minQuantity: 8, maxQuantity: 15, discountPercentage: 5 },
      { minQuantity: 16, discountPercentage: 8 }
    ],
    minimumOrder: 1,
    specialRules: "Includes integrated screen system - no additional screen charge",
    updatedAt: new Date()
  },

  // 118-Contemporary - Specialty series with screens included
  {
    id: "118-cont-sliding",
    series: "118",
    style: "Contemporary",
    productType: "Sliding Window w/screen",
    basePricePerSqFt: 39.53,
    customerPricing: {
      dealer: 39.53,
      homeowner: 55.34,   // 40% markup
      contractor: 43.48,  // 10% markup
      tm: 35.58           // 10% discount
    },
    bulkPricing: [
      { minQuantity: 5, maxQuantity: 12, discountPercentage: 3 },
      { minQuantity: 13, maxQuantity: 25, discountPercentage: 6 },
      { minQuantity: 26, discountPercentage: 9 }
    ],
    minimumOrder: 2,
    specialRules: "Includes integrated screen system - popular for residential projects",
    updatedAt: new Date()
  },

  // 152-Classic - Heavy duty lift & slide
  {
    id: "152-classic-lift",
    series: "152",
    style: "Classic",
    productType: "Lift & Slide",
    basePricePerSqFt: 74.98,
    customerPricing: {
      dealer: 74.98,
      homeowner: 104.97,  // 40% markup
      contractor: 82.48,  // 10% markup
      tm: 67.48           // 10% discount
    },
    bulkPricing: [
      { minQuantity: 2, maxQuantity: 4, discountPercentage: 2 },
      { minQuantity: 5, maxQuantity: 8, discountPercentage: 4 },
      { minQuantity: 9, discountPercentage: 7 }
    ],
    minimumOrder: 1,
    specialRules: "Heavy duty system - requires specialized installation",
    updatedAt: new Date()
  },

  // 236-Classic - Multi-track system
  {
    id: "236-classic-lift3",
    series: "236",
    style: "Classic",
    productType: "Classic Lift & Slide (3 Tracks)",
    basePricePerSqFt: 89.98,
    customerPricing: {
      dealer: 89.98,
      homeowner: 125.97,  // 40% markup
      contractor: 98.98,  // 10% markup
      tm: 80.98           // 10% discount
    },
    bulkPricing: [
      { minQuantity: 1, maxQuantity: 2, discountPercentage: 1 },
      { minQuantity: 3, maxQuantity: 5, discountPercentage: 3 },
      { minQuantity: 6, discountPercentage: 5 }
    ],
    minimumOrder: 1,
    specialRules: "3-track system - premium hardware package required (additional $2254)",
    updatedAt: new Date()
  }
]

export function FramePricingCard() {
  const [framePricing, setFramePricing] = useState<FramePricingEntry[]>(initialFramePricing)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FramePricingEntry | null>(null)
  const [newEntry, setNewEntry] = useState({
    series: "",
    style: "Contemporary",
    productType: "",
    dealerPrice: 0,
    homeownerPrice: 0,
    contractorPrice: 0,
    tmPrice: 0
  })
  const [searchTerm, setSearchTerm] = useState("")

  // Filter entries based on search term
  const filteredEntries = framePricing.filter(entry =>
    entry.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.productType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group by series for better organization
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const key = `${entry.series}-${entry.style}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(entry)
    return acc
  }, {} as Record<string, FramePricingEntry[]>)

  // Auto-generate bulk pricing based on series
  const generateBulkPricing = (series: string): BulkPricingTier[] => {
    const seriesNum = parseInt(series)
    
    // Premium series (85+) get better bulk discounts
    if (seriesNum >= 85) {
      return [
        { minQuantity: 5, maxQuantity: 14, discountPercentage: 3 },
        { minQuantity: 15, maxQuantity: 29, discountPercentage: 6 },
        { minQuantity: 30, discountPercentage: 10 }
      ]
    }
    
    // Standard series get moderate bulk discounts
    return [
      { minQuantity: 10, maxQuantity: 24, discountPercentage: 2 },
      { minQuantity: 25, maxQuantity: 49, discountPercentage: 5 },
      { minQuantity: 50, discountPercentage: 8 }
    ]
  }

  const handleSaveEntry = () => {
    if (!newEntry.series || !newEntry.productType || newEntry.dealerPrice <= 0) {
      return
    }

    const bulkPricing = generateBulkPricing(newEntry.series)

    if (editingEntry) {
      // Update existing entry
      setFramePricing(prev => prev.map(entry => 
        entry.id === editingEntry.id 
          ? { 
              ...entry, 
              series: newEntry.series,
              style: newEntry.style,
              productType: newEntry.productType,
              basePricePerSqFt: newEntry.dealerPrice,
              customerPricing: {
                dealer: newEntry.dealerPrice,
                homeowner: newEntry.homeownerPrice,
                contractor: newEntry.contractorPrice,
                tm: newEntry.tmPrice
              },
              bulkPricing: bulkPricing,
              minimumOrder: 1,
              specialRules: "",
              updatedAt: new Date()
            }
          : entry
      ))
    } else {
      // Create new entry
      const newFrameEntry: FramePricingEntry = {
        id: `${newEntry.series}-${newEntry.style.toLowerCase()}-${Date.now()}`,
        series: newEntry.series,
        style: newEntry.style,
        productType: newEntry.productType,
        basePricePerSqFt: newEntry.dealerPrice,
        customerPricing: {
          dealer: newEntry.dealerPrice,
          homeowner: newEntry.homeownerPrice,
          contractor: newEntry.contractorPrice,
          tm: newEntry.tmPrice
        },
        bulkPricing: bulkPricing,
        minimumOrder: 1,
        specialRules: "",
        updatedAt: new Date()
      }
      setFramePricing(prev => [...prev, newFrameEntry])
    }

    // Reset form
    setNewEntry({ 
      series: "", 
      style: "Contemporary", 
      productType: "", 
      dealerPrice: 0,
      homeownerPrice: 0,
      contractorPrice: 0,
      tmPrice: 0
    })
    setEditingEntry(null)
    setIsDialogOpen(false)
  }

  const handleEditEntry = (entry: FramePricingEntry) => {
    setEditingEntry(entry)
    setNewEntry({
      series: entry.series,
      style: entry.style,
      productType: entry.productType,
      dealerPrice: entry.customerPricing.dealer,
      homeownerPrice: entry.customerPricing.homeowner,
      contractorPrice: entry.customerPricing.contractor,
      tmPrice: entry.customerPricing.tm
    })
    setIsDialogOpen(true)
  }

  const handleDeleteEntry = (entryId: string) => {
    setFramePricing(prev => prev.filter(entry => entry.id !== entryId))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Frame Pricing Management
            </CardTitle>
            <CardDescription>
              Manage pricing for window and door frames by series and product type
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Frame Pricing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Frame Pricing" : "Add Frame Pricing"}
                </DialogTitle>
                <DialogDescription>
                  {editingEntry ? "Update the sophisticated frame pricing entry" : "Add a new sophisticated frame pricing entry"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="series">Series</Label>
                    <Input
                      id="series"
                      value={newEntry.series}
                      onChange={(e) => setNewEntry({ ...newEntry, series: e.target.value })}
                      placeholder="85, 76, 108, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <select
                      id="style"
                      value={newEntry.style}
                      onChange={(e) => setNewEntry({ ...newEntry, style: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Contemporary">Contemporary</option>
                      <option value="Classic">Classic</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type</Label>
                  <Input
                    id="productType"
                    value={newEntry.productType}
                    onChange={(e) => setNewEntry({ ...newEntry, productType: e.target.value })}
                    placeholder="Fixed, Casement, French Door, etc."
                  />
                </div>

                {/* Customer Pricing */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Customer Type Pricing ($/sq ft)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dealerPrice">Dealer Price (Base)</Label>
                      <Input
                        id="dealerPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newEntry.dealerPrice}
                        onChange={(e) => setNewEntry({ ...newEntry, dealerPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="homeownerPrice">Homeowner Price</Label>
                      <Input
                        id="homeownerPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newEntry.homeownerPrice}
                        onChange={(e) => setNewEntry({ ...newEntry, homeownerPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractorPrice">Contractor Price</Label>
                      <Input
                        id="contractorPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newEntry.contractorPrice}
                        onChange={(e) => setNewEntry({ ...newEntry, contractorPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tmPrice">TM Price</Label>
                      <Input
                        id="tmPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newEntry.tmPrice}
                        onChange={(e) => setNewEntry({ ...newEntry, tmPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEntry}>
                    {editingEntry ? "Update" : "Add"} Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <Input
              placeholder="Search by series, style, or product type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Pricing Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Series</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Product Type</TableHead>
                  <TableHead>Dealer</TableHead>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>TM</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedEntries).map(([groupKey, entries], groupIndex) => (
                  <>
                    {groupIndex > 0 && (
                      <TableRow key={`spacer-${groupKey}`}>
                        <TableCell colSpan={8} className="h-4 bg-gray-50 border-0"></TableCell>
                      </TableRow>
                    )}
                    {entries.map((entry, entryIndex) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-semibold">
                            {entry.series}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{entry.style}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="font-medium truncate" title={entry.productType}>
                            {entry.productType}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <div className="text-gray-900 font-semibold">
                            ${entry.customerPricing.dealer.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <div className="text-gray-900 font-semibold">
                            ${entry.customerPricing.homeowner.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <div className="text-gray-900 font-semibold">
                            ${entry.customerPricing.contractor.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <div className="text-gray-900 font-semibold">
                            ${entry.customerPricing.tm.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEntry(entry)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No frame pricing entries found. Add your first entry to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
