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
import { Plus, Edit, Trash2, Palette } from "lucide-react"

// Glazing pricing data structure based on pricing-engine.ts
interface GlazingPricingEntry {
  id: string
  glazingType: string
  paneConfiguration: string
  lowEType: string
  pricePerSqFt: number
  description: string
  updatedAt: Date
}

// Initial data from pricing-engine.ts
const initialGlazingPricing: GlazingPricingEntry[] = [
  {
    id: "dual-standard-lowe",
    glazingType: "Dual Standard Low E",
    paneConfiguration: "Dual Pane",
    lowEType: "Standard Low E",
    pricePerSqFt: 15.97,
    description: "Dual pane glass with standard Low-E coating",
    updatedAt: new Date()
  },
  {
    id: "dual-double-lowe",
    glazingType: "Dual Double Low E", 
    paneConfiguration: "Dual Pane",
    lowEType: "Double Low E",
    pricePerSqFt: 20.03,
    description: "Dual pane glass with double Low-E coating",
    updatedAt: new Date()
  },
  {
    id: "dual-triple-lowe",
    glazingType: "Dual Triple Low E",
    paneConfiguration: "Dual Pane", 
    lowEType: "Triple Low E",
    pricePerSqFt: 24.08,
    description: "Dual pane glass with triple Low-E coating",
    updatedAt: new Date()
  },
  {
    id: "triple-standard-lowe",
    glazingType: "Triple Standard Low E",
    paneConfiguration: "Triple Pane",
    lowEType: "Standard Low E",
    pricePerSqFt: 18.97,
    description: "Triple pane glass with standard Low-E coating",
    updatedAt: new Date()
  },
  {
    id: "triple-double-lowe",
    glazingType: "Triple Double Low E",
    paneConfiguration: "Triple Pane",
    lowEType: "Double Low E", 
    pricePerSqFt: 20.02,
    description: "Triple pane glass with double Low-E coating",
    updatedAt: new Date()
  },
  {
    id: "triple-triple-lowe",
    glazingType: "Triple Triple Low E",
    paneConfiguration: "Triple Pane",
    lowEType: "Triple Low E",
    pricePerSqFt: 24.08,
    description: "Triple pane glass with triple Low-E coating",
    updatedAt: new Date()
  },
  {
    id: "triple-xo-e",
    glazingType: "Triple XO E",
    paneConfiguration: "Triple Pane",
    lowEType: "XO E",
    pricePerSqFt: 26.18,
    description: "Triple pane glass with premium XO E coating",
    updatedAt: new Date()
  }
]

export function GlassTypePricingCard() {
  const [glazingPricing, setGlazingPricing] = useState<GlazingPricingEntry[]>(initialGlazingPricing)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<GlazingPricingEntry | null>(null)
  const [newEntry, setNewEntry] = useState({
    glazingType: "",
    paneConfiguration: "Dual Pane",
    lowEType: "",
    pricePerSqFt: 0,
    description: ""
  })
  const [searchTerm, setSearchTerm] = useState("")

  // Filter entries based on search term
  const filteredEntries = glazingPricing.filter(entry =>
    entry.glazingType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.paneConfiguration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.lowEType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveEntry = () => {
    if (!newEntry.glazingType || !newEntry.lowEType || newEntry.pricePerSqFt <= 0) {
      return
    }

    if (editingEntry) {
      // Update existing entry
      setGlazingPricing(prev => prev.map(entry => 
        entry.id === editingEntry.id 
          ? { 
              ...entry, 
              glazingType: newEntry.glazingType,
              paneConfiguration: newEntry.paneConfiguration,
              lowEType: newEntry.lowEType,
              pricePerSqFt: newEntry.pricePerSqFt,
              description: newEntry.description,
              updatedAt: new Date()
            }
          : entry
      ))
    } else {
      // Create new entry
      const newGlazingEntry: GlazingPricingEntry = {
        id: `glazing-${Date.now()}`,
        glazingType: newEntry.glazingType,
        paneConfiguration: newEntry.paneConfiguration,
        lowEType: newEntry.lowEType,
        pricePerSqFt: newEntry.pricePerSqFt,
        description: newEntry.description,
        updatedAt: new Date()
      }
      setGlazingPricing(prev => [...prev, newGlazingEntry])
    }

    // Reset form
    setNewEntry({ 
      glazingType: "", 
      paneConfiguration: "Dual Pane", 
      lowEType: "", 
      pricePerSqFt: 0, 
      description: "" 
    })
    setEditingEntry(null)
    setIsDialogOpen(false)
  }

  const handleEditEntry = (entry: GlazingPricingEntry) => {
    setEditingEntry(entry)
    setNewEntry({
      glazingType: entry.glazingType,
      paneConfiguration: entry.paneConfiguration,
      lowEType: entry.lowEType,
      pricePerSqFt: entry.pricePerSqFt,
      description: entry.description
    })
    setIsDialogOpen(true)
  }

  const handleDeleteEntry = (entryId: string) => {
    setGlazingPricing(prev => prev.filter(entry => entry.id !== entryId))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Glazing Pricing Management
            </CardTitle>
            <CardDescription>
              Set pricing for different glass types and Low-E coating specifications
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Glazing Pricing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Glazing Pricing" : "Add Glazing Pricing"}
                </DialogTitle>
                <DialogDescription>
                  {editingEntry ? "Update the glazing pricing entry" : "Add a new glazing pricing entry"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="glazingType">Glazing Type</Label>
                  <Input
                    id="glazingType"
                    value={newEntry.glazingType}
                    onChange={(e) => setNewEntry({ ...newEntry, glazingType: e.target.value })}
                    placeholder="Triple Standard Low E"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paneConfiguration">Pane Configuration</Label>
                  <select
                    id="paneConfiguration"
                    value={newEntry.paneConfiguration}
                    onChange={(e) => setNewEntry({ ...newEntry, paneConfiguration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Single Pane">Single Pane</option>
                    <option value="Dual Pane">Dual Pane</option>
                    <option value="Triple Pane">Triple Pane</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowEType">Low-E Type</Label>
                  <Input
                    id="lowEType"
                    value={newEntry.lowEType}
                    onChange={(e) => setNewEntry({ ...newEntry, lowEType: e.target.value })}
                    placeholder="Standard Low E, Double Low E, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerSqFt">Price per Sq Ft ($)</Label>
                  <Input
                    id="pricePerSqFt"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newEntry.pricePerSqFt}
                    onChange={(e) => setNewEntry({ ...newEntry, pricePerSqFt: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="Brief description of the glazing option"
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
              placeholder="Search by glazing type, pane configuration, or Low-E type..."
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
                  <TableHead>Glazing Type</TableHead>
                  <TableHead>Pane Config</TableHead>
                  <TableHead>Low-E Type</TableHead>
                  <TableHead>Price/Sq Ft</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.glazingType}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.paneConfiguration}</Badge>
                    </TableCell>
                    <TableCell>{entry.lowEType}</TableCell>
                    <TableCell className="font-mono font-semibold text-green-600">
                      ${entry.pricePerSqFt.toFixed(2)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={entry.description}>
                      {entry.description}
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
              No glazing pricing entries found. Add your first entry to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
