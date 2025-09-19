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
import { Plus, Edit, Trash2, Settings, Shield } from "lucide-react"

// Additional pricing data structure
interface AdditionalPricingEntry {
  id: string
  category: string
  itemName: string
  applicableSeries?: number[]
  pricingType: "per_sqft" | "flat_rate" | "per_unit"
  price: number
  minimumCharge?: number
  minimumSqFt?: number
  description: string
  updatedAt: Date
}

// Initial data from pricing-engine.ts and common additional items
const initialAdditionalPricing: AdditionalPricingEntry[] = [
  {
    id: "screen-fiberglass",
    category: "Screens",
    itemName: "Fiberglass Screen",
    applicableSeries: [79, 85],
    pricingType: "per_sqft",
    price: 9.47,
    minimumSqFt: 10.76,
    description: "Standard fiberglass screen material. If size less than 10.76 SQFT, equal to 10.76 SQFT",
    updatedAt: new Date()
  },
  {
    id: "hardware-236-classic",
    category: "Hardware",
    itemName: "Classic Lift & Slide (3 Tracks) Hardware",
    applicableSeries: [236],
    pricingType: "flat_rate",
    price: 2254.00,
    description: "Hardware set for 236-Classic Lift & Slide 3-track system",
    updatedAt: new Date()
  },
  {
    id: "hardware-120-trad-2track",
    category: "Hardware", 
    itemName: "Traditional Sliding Door (2 Tracks) Hardware",
    applicableSeries: [120],
    pricingType: "flat_rate",
    price: 1836.97,
    description: "Hardware set for 120-Contemporary Traditional Sliding Door 2-track system",
    updatedAt: new Date()
  },
  {
    id: "hardware-120-lift-2track",
    category: "Hardware",
    itemName: "Lift & Slide (2 Tracks) Hardware", 
    applicableSeries: [120],
    pricingType: "flat_rate",
    price: 2254.00,
    description: "Hardware set for 120-Contemporary Lift & Slide 2-track system",
    updatedAt: new Date()
  },
  {
    id: "hardware-185-trad-3track",
    category: "Hardware",
    itemName: "Traditional Sliding Door (3 Tracks) Hardware",
    applicableSeries: [185],
    pricingType: "flat_rate", 
    price: 1836.97,
    description: "Hardware set for 185-Contemporary Traditional Sliding Door 3-track system",
    updatedAt: new Date()
  },
  {
    id: "hardware-185-lift-3track",
    category: "Hardware",
    itemName: "Lift & Slide (3 Tracks) Hardware",
    applicableSeries: [185],
    pricingType: "flat_rate",
    price: 2043.30,
    description: "Hardware set for 185-Contemporary Lift & Slide 3-track system", 
    updatedAt: new Date()
  },
  {
    id: "hardware-251-trad-4track",
    category: "Hardware",
    itemName: "Traditional Sliding Door (4 Tracks) Hardware",
    applicableSeries: [251],
    pricingType: "flat_rate",
    price: 2043.30,
    description: "Hardware set for 251-Contemporary Traditional Sliding Door 4-track system",
    updatedAt: new Date()
  },
  {
    id: "grid-standard",
    category: "Grids",
    itemName: "Standard Grid Division",
    pricingType: "per_unit",
    price: 25.00,
    description: "Standard grid division for windows and doors",
    updatedAt: new Date()
  },
  {
    id: "packing-standard",
    category: "Packing",
    itemName: "Standard Packing",
    pricingType: "per_unit", 
    price: 50.00,
    description: "Standard packing and crating for shipping",
    updatedAt: new Date()
  }
]

export function AdditionalPricingCard() {
  const [additionalPricing, setAdditionalPricing] = useState<AdditionalPricingEntry[]>(initialAdditionalPricing)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<AdditionalPricingEntry | null>(null)
  const [newEntry, setNewEntry] = useState({
    category: "Screens",
    itemName: "",
    applicableSeries: "",
    pricingType: "per_sqft" as const,
    price: 0,
    minimumCharge: 0,
    minimumSqFt: 0,
    description: ""
  })
  const [searchTerm, setSearchTerm] = useState("")

  // Filter entries based on search term
  const filteredEntries = additionalPricing.filter(entry =>
    entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group by category
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = []
    }
    acc[entry.category].push(entry)
    return acc
  }, {} as Record<string, AdditionalPricingEntry[]>)

  const handleSaveEntry = () => {
    if (!newEntry.itemName || newEntry.price <= 0) {
      return
    }

    const applicableSeriesArray = newEntry.applicableSeries 
      ? newEntry.applicableSeries.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
      : undefined

    if (editingEntry) {
      // Update existing entry
      setAdditionalPricing(prev => prev.map(entry => 
        entry.id === editingEntry.id 
          ? { 
              ...entry, 
              category: newEntry.category,
              itemName: newEntry.itemName,
              applicableSeries: applicableSeriesArray,
              pricingType: newEntry.pricingType,
              price: newEntry.price,
              minimumCharge: newEntry.minimumCharge || undefined,
              minimumSqFt: newEntry.minimumSqFt || undefined,
              description: newEntry.description,
              updatedAt: new Date()
            }
          : entry
      ))
    } else {
      // Create new entry
      const newAdditionalEntry: AdditionalPricingEntry = {
        id: `additional-${Date.now()}`,
        category: newEntry.category,
        itemName: newEntry.itemName,
        applicableSeries: applicableSeriesArray,
        pricingType: newEntry.pricingType,
        price: newEntry.price,
        minimumCharge: newEntry.minimumCharge || undefined,
        minimumSqFt: newEntry.minimumSqFt || undefined,
        description: newEntry.description,
        updatedAt: new Date()
      }
      setAdditionalPricing(prev => [...prev, newAdditionalEntry])
    }

    // Reset form
    setNewEntry({ 
      category: "Screens",
      itemName: "",
      applicableSeries: "",
      pricingType: "per_sqft",
      price: 0,
      minimumCharge: 0,
      minimumSqFt: 0,
      description: ""
    })
    setEditingEntry(null)
    setIsDialogOpen(false)
  }

  const handleEditEntry = (entry: AdditionalPricingEntry) => {
    setEditingEntry(entry)
    setNewEntry({
      category: entry.category,
      itemName: entry.itemName,
      applicableSeries: entry.applicableSeries?.join(', ') || "",
      pricingType: entry.pricingType,
      price: entry.price,
      minimumCharge: entry.minimumCharge || 0,
      minimumSqFt: entry.minimumSqFt || 0,
      description: entry.description
    })
    setIsDialogOpen(true)
  }

  const handleDeleteEntry = (entryId: string) => {
    setAdditionalPricing(prev => prev.filter(entry => entry.id !== entryId))
  }

  const getPricingTypeLabel = (type: string) => {
    switch (type) {
      case 'per_sqft': return 'Per Sq Ft'
      case 'flat_rate': return 'Flat Rate'
      case 'per_unit': return 'Per Unit'
      default: return type
    }
  }

  const getPricingTypeColor = (type: string) => {
    switch (type) {
      case 'per_sqft': return 'bg-blue-100 text-blue-800'
      case 'flat_rate': return 'bg-green-100 text-green-800'  
      case 'per_unit': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Additional Pricing Management
            </CardTitle>
            <CardDescription>
              Configure pricing for screens, hardware, grids, packing, and other add-ons
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Additional Pricing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Additional Pricing" : "Add Additional Pricing"}
                </DialogTitle>
                <DialogDescription>
                  {editingEntry ? "Update the additional pricing entry" : "Add a new additional pricing entry"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newEntry.category}
                    onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Screens">Screens</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Grids">Grids</option>
                    <option value="Packing">Packing</option>
                    <option value="Installation">Installation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newEntry.itemName}
                    onChange={(e) => setNewEntry({ ...newEntry, itemName: e.target.value })}
                    placeholder="Fiberglass Screen, Hardware Set, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicableSeries">Applicable Series (comma-separated)</Label>
                  <Input
                    id="applicableSeries"
                    value={newEntry.applicableSeries}
                    onChange={(e) => setNewEntry({ ...newEntry, applicableSeries: e.target.value })}
                    placeholder="79, 85, 108 (leave blank if applies to all)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricingType">Pricing Type</Label>
                  <select
                    id="pricingType"
                    value={newEntry.pricingType}
                    onChange={(e) => setNewEntry({ ...newEntry, pricingType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="per_sqft">Per Square Foot</option>
                    <option value="flat_rate">Flat Rate</option>
                    <option value="per_unit">Per Unit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newEntry.price}
                    onChange={(e) => setNewEntry({ ...newEntry, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {newEntry.pricingType === 'per_sqft' && (
                  <div className="space-y-2">
                    <Label htmlFor="minimumSqFt">Minimum Sq Ft (optional)</Label>
                    <Input
                      id="minimumSqFt"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newEntry.minimumSqFt}
                      onChange={(e) => setNewEntry({ ...newEntry, minimumSqFt: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="Brief description of the item and pricing rules"
                  />
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
              placeholder="Search by category, item name, or description..."
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
                  <TableHead>Category</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Series</TableHead>
                  <TableHead>Pricing Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Min Rules</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge variant="outline">{entry.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{entry.itemName}</TableCell>
                    <TableCell>
                      {entry.applicableSeries ? (
                        <div className="flex gap-1 flex-wrap">
                          {entry.applicableSeries.map(series => (
                            <Badge key={series} variant="secondary" className="text-xs">
                              {series}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">All</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPricingTypeColor(entry.pricingType)}>
                        {getPricingTypeLabel(entry.pricingType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-green-600">
                      ${entry.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.minimumSqFt && (
                        <div>Min: {entry.minimumSqFt} sq ft</div>
                      )}
                      {entry.minimumCharge && (
                        <div>Min: ${entry.minimumCharge}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {entry.updatedAt.toLocaleDateString()}
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
              </TableBody>
            </Table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No additional pricing entries found. Add your first entry to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
