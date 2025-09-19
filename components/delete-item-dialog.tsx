"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface DeleteItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  item: any
}

export function DeleteItemDialog({ isOpen, onClose, onConfirm, item }: DeleteItemDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete Item
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be undone and will automatically recalculate the quotation totals.
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">Item #{item.itemNumber}</h3>
            <p className="text-gray-700">{item.designDetails?.frameType || 'Unknown Frame Type'}</p>
            <p className="text-sm text-gray-600">
              Quantity: {item.quantity || 1} × ${(item.unitPrice || 0).toLocaleString()} = ${(item.totalPrice || 0).toLocaleString()}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
