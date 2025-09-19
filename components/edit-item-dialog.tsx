"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { recalculateItemPricing } from "@/lib/pricing-engine"

interface EditItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedItem: any) => void
  item: any
}

export function EditItemDialog({ isOpen, onClose, onSave, item }: EditItemDialogProps) {
  const [editedItem, setEditedItem] = useState<any>(null)
  const [isRecalculating, setIsRecalculating] = useState(false)

  useEffect(() => {
    if (item) {
      setEditedItem({ ...item })
    }
  }, [item])

  const handleSave = async () => {
    if (!editedItem) return

    setIsRecalculating(true)
    try {
      // Recalculate pricing with updated values
      const recalculatedItem = recalculateItemPricing(editedItem)
      onSave(recalculatedItem)
      onClose()
    } catch (error) {
      console.error('Error recalculating pricing:', error)
      alert('Error recalculating pricing. Please try again.')
    } finally {
      setIsRecalculating(false)
    }
  }

  const handleCancel = () => {
    setEditedItem(item ? { ...item } : null)
    onClose()
  }

  const updateField = (field: string, value: any) => {
    if (!editedItem) return
    setEditedItem({
      ...editedItem,
      [field]: value
    })
  }

  const updateNestedField = (path: string[], value: any) => {
    if (!editedItem) return
    const newItem = { ...editedItem }
    let current = newItem
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {}
      current = current[path[i]]
    }
    current[path[path.length - 1]] = value
    setEditedItem(newItem)
  }

  if (!editedItem) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item #{editedItem.itemNumber}</DialogTitle>
          <DialogDescription>
            Modify the item details. Pricing will be automatically recalculated when you save.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={editedItem.quantity || 1}
                onChange={(e) => updateField('quantity', parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="frameType">Frame Type</Label>
              <Input
                id="frameType"
                value={editedItem.designDetails?.frameType || ''}
                onChange={(e) => updateNestedField(['designDetails', 'frameType'], e.target.value)}
              />
            </div>
          </div>

          {/* Design Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Design Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="series">Series</Label>
                <Input
                  id="series"
                  value={editedItem.designDetails?.series || ''}
                  onChange={(e) => updateNestedField(['designDetails', 'series'], e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="style">Style</Label>
                <Select
                  value={editedItem.designDetails?.style || ''}
                  onValueChange={(value) => updateNestedField(['designDetails', 'style'], value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Classic">Classic</SelectItem>
                    <SelectItem value="Contemporary">Contemporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={editedItem.designDetails?.type || ''}
                  onChange={(e) => updateNestedField(['designDetails', 'type'], e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="swing">Swing</Label>
                <Input
                  id="swing"
                  value={editedItem.designDetails?.swing || ''}
                  onChange={(e) => updateNestedField(['designDetails', 'swing'], e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dimensions">Dimensions (mm)</Label>
              <Input
                id="dimensions"
                value={editedItem.designDetails?.dimensions || ''}
                onChange={(e) => updateNestedField(['designDetails', 'dimensions'], e.target.value)}
                placeholder="e.g., 1200 x 1500 mm"
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="externalFinish">External Finish</Label>
                <Input
                  id="externalFinish"
                  value={editedItem.appearance?.externalFinish || ''}
                  onChange={(e) => updateNestedField(['appearance', 'externalFinish'], e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="internalFinish">Internal Finish</Label>
                <Input
                  id="internalFinish"
                  value={editedItem.appearance?.internalFinish || ''}
                  onChange={(e) => updateNestedField(['appearance', 'internalFinish'], e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Glazing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Glazing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="glazingType">Glass Type</Label>
                <Input
                  id="glazingType"
                  value={editedItem.glazing?.type || ''}
                  onChange={(e) => updateNestedField(['glazing', 'type'], e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="glazingSpecs">Glazing Specs</Label>
                <Textarea
                  id="glazingSpecs"
                  value={editedItem.glazing?.specs || ''}
                  onChange={(e) => updateNestedField(['glazing', 'specs'], e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paneCount">Pane Count</Label>
                <Input
                  id="paneCount"
                  type="number"
                  min="1"
                  max="3"
                  value={editedItem.glazing?.paneCount || ''}
                  onChange={(e) => updateNestedField(['glazing', 'paneCount'], parseInt(e.target.value) || null)}
                />
              </div>
              <div>
                <Label htmlFor="lowECount">Low-E Count</Label>
                <Input
                  id="lowECount"
                  type="number"
                  min="0"
                  max="3"
                  value={editedItem.glazing?.lowECount || ''}
                  onChange={(e) => updateNestedField(['glazing', 'lowECount'], parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Current Pricing Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Pricing</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Unit Price</p>
                <p className="font-semibold">${(editedItem.unitPrice || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Quantity</p>
                <p className="font-semibold">{editedItem.quantity || 1}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Price</p>
                <p className="font-semibold">${((editedItem.unitPrice || 0) * (editedItem.quantity || 1)).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isRecalculating}>
            {isRecalculating ? 'Recalculating...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
